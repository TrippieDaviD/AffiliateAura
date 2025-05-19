import React, { useEffect, useState } from "react";
import { ShortLink } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, AlertCircle, ExternalLink } from "lucide-react";

export default function GoLink() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [link, setLink] = useState(null);
  
  useEffect(() => {
    const fetchLinkAndRedirect = async () => {
      try {
        // Extract slug from URL path
        const path = window.location.pathname;
        const slug = path.split('/go/')[1];
        
        if (!slug) {
          setError("Invalid link");
          setLoading(false);
          return;
        }
        
        console.log('Looking up slug:', slug);
        
        // Find the corresponding short link
        const links = await ShortLink.filter({ slug });
        
        if (links.length === 0) {
          setError("This link does not exist or has expired");
          setLoading(false);
          return;
        }
        
        const foundLink = links[0];
        setLink(foundLink);
        
        // Update click count
        await ShortLink.update(foundLink.id, { click_count: (foundLink.click_count || 0) + 1 });
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = foundLink.destination_url;
        }, 1500);
      } catch (err) {
        console.error("Error redirecting:", err);
        setError("There was an error processing this link");
        setLoading(false);
      }
    };
    
    fetchLinkAndRedirect();
  }, []);
  
  // If user stays on this page (redirection blocked or delayed)
  const handleManualRedirect = () => {
    if (link && link.destination_url) {
      window.location.href = link.destination_url;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        {loading && !error && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
            </div>
            <h1 className="text-xl font-semibold mb-2">Redirecting you...</h1>
            {link && (
              <div>
                <p className="text-gray-500 mb-4">
                  Taking you to your destination
                </p>
                <div className="bg-gray-100 p-3 rounded-lg text-sm truncate mb-3">
                  {link.destination_url}
                </div>
                
                <button
                  onClick={handleManualRedirect}
                  className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Click here if you are not redirected automatically
                </button>
              </div>
            )}
          </>
        )}
        
        {error && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Link Error</h1>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link 
              to={createPageUrl("Dashboard")}
              className="text-blue-600 hover:underline flex items-center justify-center"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}