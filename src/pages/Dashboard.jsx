
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { AffiliateLink } from "@/api/entities";
import { Partnership } from "@/api/entities";
import { BarChart, Link2, Users, Clock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsOverview from "../components/dashboard/StatsOverview";
import LinksList from "../components/dashboard/LinksList";
import PartnershipsTable from "../components/dashboard/PartnershipsTable";

export default function Dashboard() {
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Initial load with retry mechanism
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user data first
      try {
        const userData = await User.me();
        setUser(userData);
        console.log("Current user data:", userData);
        
        // Only try to load dashboard data if we have user data
        if (userData) {
          await loadDashboardData(userData);
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        // handleError(userError);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadDashboardData = async (userData) => {
    if (!userData) return;

    try {
      // Load links - use filter to only get current user's links
      try {
        console.log("Loading links for user:", userData.email);
        const allLinks = await AffiliateLink.filter({ created_by: userData.email });
        console.log("User's links loaded:", allLinks);
        setAffiliateLinks(allLinks || []);
      } catch (linksError) {
        console.error("Error loading affiliate links:", linksError);
      }
      
      // Load partnerships
      try {
        const partners = await Partnership.list();
        setPartnerships(partners || []);
      } catch (partnersError) {
        console.error("Error loading partnerships:", partnersError);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err) => {
    console.error("Dashboard error:", err);
    
    if (err.message && err.message.includes("Network Error")) {
      if (retryAttempts < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, retryAttempts) * 1000;
        console.log(`Retrying in ${delay}ms (attempt ${retryAttempts + 1})`);
        
        setRetryAttempts(prev => prev + 1);
        setTimeout(() => {
          loadUserAndData();
        }, delay);
        
        return;
      }
      
      setError({
        title: "Network Connection Issue",
        message: "Unable to connect to the server. Please check your internet connection and try again."
      });
    } else {
      setError({
        title: "Something went wrong",
        message: "We encountered an error while loading your data. Please try refreshing the page."
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserAndData();
  };

  // Fallback when data can't be loaded
  if (error && !user) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        Current user email: {user?.email || "Not logged in"}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button 
                variant="link" 
                onClick={handleRefresh} 
                className="p-0 h-auto text-red-300 hover:text-white pl-1"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Try Again'}
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Manage your affiliate links and partnerships</p>
        </div>
        <div className="flex gap-3">
          {isRefreshing ? (
            <Button disabled className="bg-gray-200 cursor-not-allowed">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="border-gray-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Link 
            to={createPageUrl("CreateLink")}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            Create New Link
          </Link>
        </div>
      </div>

      <StatsOverview 
        totalLinks={affiliateLinks.length}
        totalClicks={affiliateLinks.reduce((sum, link) => sum + (link.click_count || 0), 0)}
        activePartnerships={partnerships.filter(p => p.status === "active").length}
      />

      <Tabs defaultValue="links" className="mt-8">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
          <TabsTrigger value="links" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
            <Link2 className="w-4 h-4" />
            My Links
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            Partnerships
          </TabsTrigger>
          {/* Only show pending tab for admin */}
          {user?.email === "david.wigbert@gmail.com" && (
            <TabsTrigger value="pending" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <Clock className="w-4 h-4" />
              Pending Approvals ({partnerships.filter(p => p.status === 'pending' || p.status === 'pending_review').length})
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
            <BarChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="mt-6">
          <LinksList links={affiliateLinks} isLoading={isLoading} onUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="partnerships" className="mt-6">
          <PartnershipsTable 
            partnerships={partnerships.filter(p => p.created_by === user?.email || p.status === 'active')} 
            isLoading={isLoading} 
            onUpdate={loadDashboardData}
            isAdmin={user?.email === "david.wigbert@gmail.com"}
          />
        </TabsContent>

        {/* Only render pending content for admin */}
        {user?.email === "david.wigbert@gmail.com" && (
          <TabsContent value="pending" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Partnership Requests</h3>
                  <PartnershipsTable 
                    partnerships={partnerships.filter(p => p.status === 'pending')} 
                    isLoading={isLoading} 
                    onUpdate={loadDashboardData}
                    isAdmin={true}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Business Partnership Requests</h3>
                  <PartnershipsTable 
                    partnerships={partnerships.filter(p => p.status === 'pending_review' && p.partner_type === 'business')} 
                    isLoading={isLoading} 
                    onUpdate={loadDashboardData}
                    isAdmin={true}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analytics" className="mt-6">
          <Card className="p-6">
            <p className="text-gray-500 text-center">
              Detailed analytics coming soon...
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
