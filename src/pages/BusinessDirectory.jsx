
import React, { useState, useEffect } from "react";
import { Partnership } from "@/api/entities";
import { User } from "@/api/entities";
import { AffiliateLink } from "@/api/entities"; // Added import for links
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added tabs
import { Search, Building, ExternalLink, Mail, Filter, AlertCircle, Link2, Users, BarChart3 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const [linksData, setLinksData] = useState(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');
      
      // Check if user has any partnerships
      const userPartnerships = await Partnership.filter({
        created_by: currentUser.email
      });
      
      setHasAccess(currentUser.role === 'admin' || userPartnerships.length > 0);
      
      if (currentUser.role === 'admin' || userPartnerships.length > 0) {
        loadBusinesses();
      }
    } catch (error) {
      console.error("Error checking access:", error);
    }
    setIsLoading(false);
  };

  const loadBusinesses = async () => {
    try {
      // Only load active businesses for regular users, all businesses for admins
      const partnerships = await Partnership.filter({
        partner_type: "business",
        ...(isAdmin ? {} : { status: "active" })
      });
      setBusinesses(partnerships);
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const loadBusinessAnalytics = async (business) => {
    if (!business || !business.website) return;
    
    setIsAnalyticsLoading(true);
    try {
      // Get all affiliate links
      const allLinks = await AffiliateLink.list();
      
      // Filter links that contain the business website
      const businessLinks = allLinks.filter(link => 
        link.original_url.includes(business.website) ||
        (business.website.includes('http') && link.original_url.includes(business.website.replace(/(^\w+:|^)\/\//, '')))
      );
      
      // Calculate total clicks
      const totalClicks = businessLinks.reduce((sum, link) => sum + (link.click_count || 0), 0);
      
      setLinksData({
        totalLinks: businessLinks.length,
        totalClicks: totalClicks,
        links: businessLinks.slice(0, 10) // Show only top 10 links
      });
      
    } catch (error) {
      console.error("Error loading business analytics:", error);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const extractBusinessInfo = (notes) => {
    if (!notes) return {};
    const info = {};
    const lines = notes.split('\n');
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
  };

  // When opening business details, load analytics
  const handleViewBusinessDetails = (business) => {
    setSelectedBusiness(business);
    loadBusinessAnalytics(business);
  };

  const filteredBusinesses = businesses.filter(business => {
    const info = extractBusinessInfo(business.notes);
    return (
      (business.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
       business.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
       info.Business?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || info.Category === selectedCategory)
    );
  });

  // Add function to check if current user owns the business
  const isBusinessOwner = (business) => {
    return user && business && business.contact_email === user.email;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
          <p className="text-gray-500">Find and connect with our approved business partners</p>
        </div>
        {isAdmin && (
          <Link to={createPageUrl("BusinessPartnership")}>
            <Button>
              <Building className="mr-2 h-4 w-4" />
              Add New Business
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search businesses by name, description, or website..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="home">Home & Living</SelectItem>
              <SelectItem value="beauty">Beauty</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </Card>
          ))
        ) : filteredBusinesses.map((business) => {
          const info = extractBusinessInfo(business.notes);
          return (
            <Card 
              key={business.id} 
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewBusinessDetails(business)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{info.Business}</h3>
                  <p className="text-sm text-gray-600 truncate">{business.website}</p>
                </div>
                <Badge className={`
                  ${business.status === 'active' ? 'bg-green-100 text-green-800' : 
                    business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {business.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {info.Product}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Commission: {info['Commission offer']}
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Business Partner Details</DialogTitle>
          </DialogHeader>
          
          {selectedBusiness && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                {/* Only show analytics tab if user is the business owner or admin */}
                {(isBusinessOwner(selectedBusiness) || isAdmin) && (
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="details" className="pt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">Business Information</h3>
                      <p className="text-sm text-gray-600">{extractBusinessInfo(selectedBusiness.notes).Business}</p>
                      <a 
                        href={selectedBusiness.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                      >
                        {selectedBusiness.website} <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-1">Contact</h3>
                      <p className="text-sm text-gray-600">{extractBusinessInfo(selectedBusiness.notes).Contact}</p>
                      <a 
                        href={`mailto:${selectedBusiness.contact_email}`}
                        className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                      >
                        {selectedBusiness.contact_email} <Mail className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Product Description</h3>
                    <p className="text-sm text-gray-600">{extractBusinessInfo(selectedBusiness.notes).Product}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Commission Structure</h3>
                    <p className="text-sm text-gray-600">{extractBusinessInfo(selectedBusiness.notes)['Commission offer']}</p>
                  </div>

                  {extractBusinessInfo(selectedBusiness.notes)['Additional info'] && (
                    <div>
                      <h3 className="font-semibold mb-1">Additional Information</h3>
                      <p className="text-sm text-gray-600">{extractBusinessInfo(selectedBusiness.notes)['Additional info']}</p>
                    </div>
                  )}

                  {/* Only show admin actions if user is admin AND status is not active */}
                  {isAdmin && selectedBusiness.status !== 'active' && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-2">Admin Actions</h3>
                      <div className="flex gap-2">
                        <Button 
                          onClick={async () => {
                            await Partnership.update(selectedBusiness.id, { status: 'active' });
                            loadBusinesses();
                            setSelectedBusiness(null);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={async () => {
                            await Partnership.update(selectedBusiness.id, { status: 'rejected' });
                            loadBusinesses();
                            setSelectedBusiness(null);
                          }}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Only render analytics content if user is the business owner or admin */}
              {(isBusinessOwner(selectedBusiness) || isAdmin) && (
                <TabsContent value="analytics" className="pt-4">
                  <div className="space-y-6">
                    {!selectedBusiness.status === "active" ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Analytics are only available for approved business partners</p>
                      </div>
                    ) : isAnalyticsLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-20 bg-gray-100 rounded-lg"></div>
                        <div className="h-40 bg-gray-100 rounded-lg"></div>
                      </div>
                    ) : linksData ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="text-center">
                              <h3 className="text-sm text-gray-500">Total Links</h3>
                              <p className="text-3xl font-bold mt-2">{linksData.totalLinks}</p>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="text-center">
                              <h3 className="text-sm text-gray-500">Total Clicks</h3>
                              <p className="text-3xl font-bold mt-2">{linksData.totalClicks}</p>
                            </div>
                          </Card>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-3">Recent Affiliate Links</h3>
                          {linksData.links.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Link Title
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Short URL
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Clicks
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {linksData.links.map(link => (
                                    <tr key={link.id}>
                                      <td className="px-4 py-2">
                                        {link.title || 'Untitled Link'}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span className="font-mono">{link.dub_short_url}</span>
                                      </td>
                                      <td className="px-4 py-2">
                                        {link.click_count || 0}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <a 
                                          href={link.dub_short_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-blue-600 hover:text-blue-900"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          Visit <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No affiliate links found for your business yet
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No analytics data available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
