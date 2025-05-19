import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AffiliateLink } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Link2 } from "lucide-react";

// This is a fallback for non-dub.co links
export default function Redirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (!id) {
          // No ID provided, redirect to home
          window.location.href = "/";
          return;
        }

        // Find the link by unique_id
        const links = await AffiliateLink.filter({ unique_id: id });
        
        if (links.length === 0) {
          // Link not found, redirect to home
          window.location.href = "/";
          return;
        }
        
        const link = links[0];
        
        // If this is a dub.co link, it should have redirected already
        // This is just a fallback
        if (link.uses_dub_co) {
          window.location.href = link.affiliate_url;
          return;
        }
        
        // Update click count
        try {
          await AffiliateLink.update(link.id, {
            click_count: (link.click_count || 0) + 1
          });
        } catch (err) {
          console.error("Error updating click count:", err);
          // Not critical, continue with redirect
        }
        
        // Redirect to the destination
        window.location.href = link.original_url;
      } catch (error) {
        console.error("Error handling redirect:", error);
        // Error occurred, redirect to home
        window.location.href = "/";
      }
    };
    
    handleRedirect();
  }, [id, navigate]);

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-black rounded-xl p-3">
            <Link2 className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Redirecting you...</h2>
        <p className="text-gray-500">Please wait while we process your request</p>
      </Card>
    </div>
  );
}