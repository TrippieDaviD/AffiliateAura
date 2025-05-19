
import React, { useState, useEffect } from "react";
import { Partnership } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendEmail } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { 
  Check, 
  X, 
  Users, 
  Building, 
  Search, 
  Shield, 
  Mail, 
  ExternalLink,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { AffiliateLink } from "@/api/entities";
import { Link as ReactRouterLink } from 'react-router-dom';

export default function AdminPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [businessPartners, setBusinessPartners] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "Your AffiliateAura Partnership Application",
    body: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allLinks, setAllLinks] = useState([]);
  const isAdmin = user?.email !== "davidwigbert@gmail.com";

  useEffect(() => {
    // loadDataAndCheckAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAllLinks();
    }
  }, [isAdmin]);

  const loadAllLinks = async () => {
    try {
      const links = await AffiliateLink.list();
      setAllLinks(links);
    } catch (error) {
      console.error("Error loading links:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // loadDataAndCheckAccess();
  };

  const handleError = (error) => {
    console.error("Error:", error);
    setError({
      title: "Error",
      message: error.message || "An unexpected error occurred. Please try again."
    });
  };

  const loadDataAndCheckAccess = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await User.me();
      setUser(userData);
      console.log("AdminPanel - Current user:", userData);
      
      // if (userData.email !== "davidwigbert@gmail.com") {
        const allPartnerships = await Partnership.list();
        console.log("All partnerships loaded:", allPartnerships);
        
        // Properly filter business and affiliate partnerships
        const businesses = allPartnerships.filter(p => p.partner_type === "business");
        const affiliates = allPartnerships.filter(p => !p.partner_type || p.partner_type === "affiliate");
        
        console.log("Filtered businesses:", businesses);
        console.log("Filtered affiliates:", affiliates);
        
        setPartnerships(affiliates);
        setBusinessPartners(businesses);
      // }
    } catch (error) {
      console.error("Error loading data:", error);
      setError({
        title: "Data Loading Error",
        message: "Unable to load data. Please try refreshing the page."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      // Make sure we keep the partner_type when updating status
      await Partnership.update(item.id, { 
        status: newStatus,
        partner_type: item.partner_type // Preserve the partner type
      });
      
      // Send email notification
      try {
        const statusMessages = {
          active: "We're happy to inform you that your partnership application has been approved!",
          rejected: "After careful review, we regret to inform you that we're unable to approve your partnership application at this time."
        };
        
        await SendEmail({
          to: item.contact_email,
          subject: `Your AffiliateAura Partnership Application: ${newStatus.toUpperCase()}`,
          body: `
Hello,

${statusMessages[newStatus] || `The status of your partnership application has been updated to: ${newStatus}`}

Website: ${item.website}

If you have any questions, please don't hesitate to reach out.

Best regards,
AffiliateAura Team
          `
        });
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
      
      // await loadDataAndCheckAccess(); // Reload data after update
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleOpenEmailDialog = (email) => {
    setEmailContent({
      to: email,
      subject: "Your AffiliateAura Partnership Application",
      body: `Hello,

Thank you for your interest in partnering with AffiliateAura.

[Your message here]

Best regards,
AffiliateAura Team`
    });
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    try {
      await SendEmail({
        to: emailContent.to,
        subject: emailContent.subject,
        body: emailContent.body
      });
      setIsEmailDialogOpen(false);
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  const extractBusinessInfo = (notes) => {
    if (!notes) return {};
    
    const info = {};
    const lines = notes ? notes.split('\n') : [];
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
  };

  // Filter functions
  const filterItems = (items) => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      const businessInfo = extractBusinessInfo(item.notes);
      const searchString = (
        item.website + 
        item.contact_email + 
        (item.notes || "") + 
        (businessInfo.Business || "") + 
        (businessInfo.Contact || "")
      ).toLowerCase();
      
      return searchString.includes(searchTerm.toLowerCase());
    });
  };

  const filteredPartnerships = filterItems(partnerships);
  const filteredBusinesses = filterItems(businessPartners);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <div>
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </div>
        </Alert>
        
        <div className="text-center mt-8">
          <Button 
            onClick={handleRefresh} 
            className="flex items-center gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
          </Button>
        </div>
      </div>
    );
  }

  // Display admin or access denied message
  
  
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <div>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access the admin panel. 
              Current user: {user?.email || "Not logged in"}
            </AlertDescription>
          </div>
        </Alert>
        
        <div className="text-center mt-8">
          <Button 
            onClick={() => window.location.href = createPageUrl("Dashboard")} 
            className="flex items-center gap-2"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Modify the business partners table content
  const BusinessPartnersTable = ({ items, onViewDetails }) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No business partners to display</p>
          <Link to={createPageUrl("BusinessPartnership")} className="mt-4 inline-block">
            <Button>Add Business Partner</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const businessInfo = extractBusinessInfo(item.notes);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{businessInfo.Business || 'N/A'}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.website}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{item.contact_email}</div>
                    {businessInfo.Contact && (
                      <div className="text-sm text-gray-500">{businessInfo.Contact}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      item.status === "active" ? "bg-green-100 text-green-800" :
                      item.status === "pending" || item.status === "pending_review" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(item)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Admin view
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="mr-2 h-6 w-6" /> Admin Panel
        </h1>
        <p className="text-gray-500">Manage partnership and business applications</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by email, website, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                These applications require your review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingApplicationsTable 
                partnerships={filteredPartnerships.filter(p => p.status === "pending" || p.status === "pending_review")}
                businessPartnerships={filteredBusinesses.filter(p => p.status === "pending" || p.status === "pending_review")}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Partnerships</CardTitle>
              <CardDescription>
                Currently active partnerships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnershipTable 
                items={[
                  ...filteredPartnerships.filter(p => p.status === "active"),
                  ...filteredBusinesses.filter(p => p.status === "active")
                ]}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
              <CardDescription>
                Applications that have been rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnershipTable 
                items={[
                  ...filteredPartnerships.filter(p => p.status === "rejected"),
                  ...filteredBusinesses.filter(p => p.status === "rejected")
                ]}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Partners</CardTitle>
              <CardDescription>
                All affiliate partnership applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnershipTable 
                items={filteredPartnerships}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Business Partners</CardTitle>
              <CardDescription>
                All business partnership applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessPartnersTable 
                items={filteredBusinesses}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>All Affiliate Links</CardTitle>
              <CardDescription>
                Overview of all generated affiliate links and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinksList 
                links={allLinks} 
                isLoading={isLoading} 
                onUpdate={loadAllLinks}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      {selectedItem && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Partnership Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedItem.partner_type === "business" 
                      ? extractBusinessInfo(selectedItem.notes).Business || "Business Partner" 
                      : "Affiliate Partner"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={
                      selectedItem.status === "active" ? "bg-green-100 text-green-800" :
                      selectedItem.status === "pending" || selectedItem.status === "pending_review" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {selectedItem.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedItem.partner_type || "affiliate"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenEmailDialog(selectedItem.contact_email)}
                  >
                    <Mail className="w-4 h-4 mr-1" /> Contact
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedItem.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" /> Visit Site
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Contact Information</h4>
                  <p className="mt-1">{selectedItem.contact_email}</p>
                  {selectedItem.partner_type === "business" && extractBusinessInfo(selectedItem.notes).Contact && (
                    <p className="mt-1">{extractBusinessInfo(selectedItem.notes).Contact}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Website</h4>
                  <p className="mt-1 break-all">{selectedItem.website}</p>
                </div>
                
                {selectedItem.commission_rate && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Commission Rate</h4>
                    <p className="mt-1">{selectedItem.commission_rate}%</p>
                  </div>
                )}
              </div>
              
              {selectedItem.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Additional Information</h4>
                    <p className="mt-1 whitespace-pre-line">{selectedItem.notes}</p>
                  </div>
                </>
              )}
              
              <Separator />
              
              <DialogFooter className="gap-2">
                {(selectedItem.status === "pending" || selectedItem.status === "pending_review") && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange(selectedItem, "rejected")}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(selectedItem, "active")}
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </>
                )}
                
                {selectedItem.status === "active" && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleStatusChange(selectedItem, "rejected")}
                  >
                    <X className="mr-2 h-4 w-4" /> Deactivate
                  </Button>
                )}
                
                {selectedItem.status === "rejected" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange(selectedItem, "active")}
                  >
                    <Check className="mr-2 h-4 w-4" /> Reactivate
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={emailContent.to}
                onChange={(e) => setEmailContent({...emailContent, to: e.target.value})}
                readOnly
              />
            </div>
            
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailContent.subject}
                onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailContent.body}
                onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component for pending applications table
function PendingApplicationsTable({ partnerships, businessPartnerships, onViewDetails }) {
  if (partnerships.length === 0 && businessPartnerships.length === 0) {
    return <p className="text-center py-4 text-gray-500">No pending applications</p>;
  }
  
  return (
    <div className="space-y-6">
      {partnerships.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Users className="mr-2 h-5 w-5" /> Affiliate Applications
          </h3>
          <PartnershipTable items={partnerships} onViewDetails={onViewDetails} />
        </div>
      )}
      
      {businessPartnerships.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Building className="mr-2 h-5 w-5" /> Business Applications
          </h3>
          <PartnershipTable items={businessPartnerships} onViewDetails={onViewDetails} />
        </div>
      )}
    </div>
  );
}

// Reusable partnership table component
function PartnershipTable({ items, onViewDetails }) {
  if (items.length === 0) {
    return <p className="text-center py-4 text-gray-500">No items to display</p>;
  }
  
  const extractBusinessInfo = (notes) => {
    if (!notes) return {};
    
    const info = {};
    const lines = notes ? notes.split('\n') : [];
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Website</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const businessInfo = extractBusinessInfo(item.notes);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {item.partner_type === "business" 
                        ? businessInfo.Business || item.website
                        : item.website}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.website}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {item.contact_email}
                  {item.partner_type === "business" && businessInfo.Contact && (
                    <div className="text-sm text-gray-500">{businessInfo.Contact}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={
                    item.status === "active" ? "bg-green-100 text-green-800" :
                    item.status === "pending" || item.status === "pending_review" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(item.created_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(item)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function LinksList({ links, isLoading, onUpdate }) {
  if (isLoading) {
    return <p className="text-center py-4 text-gray-500">Loading links...</p>;
  }

  if (!links || links.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No affiliate links to display</p>
        <ReactRouterLink to={createPageUrl("AffiliateLinks/Create")} className="mt-4 inline-block">
          <Button>Create Affiliate Link</Button>
        </ReactRouterLink>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map(link => (
            <TableRow key={link.id}>
              <TableCell>{link.name}</TableCell>
              <TableCell>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {link.url}
                </a>
              </TableCell>
              <TableCell>{new Date(link.created_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <ReactRouterLink to={createPageUrl(`AffiliateLinks/Edit/${link.id}`)}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </ReactRouterLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
