
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, Trash2, Check, BarChart, AlertCircle, Tag } from "lucide-react";
import { createPageUrl, extractBusinessInfo } from "@/utils"; // Updated import path
import { format } from "date-fns";
import { AffiliateLink } from "@/api/entities";
import { Partnership } from "@/api/entities";

export default function LinksList({ links, isLoading, onUpdate }) {
  const [copySuccess, setCopyStatus] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ inProgress: false, id: null });
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadPartners();
    // Don't load stats automatically - it's causing errors
    // We'll add a safe version later
  }, [links]);

  const loadPartners = async () => {
    try {
      const allPartners = await Partnership.list();
      setPartners(allPartners);
    } catch (error) {
      console.error("Error loading partners:", error);
    }
  };

  const getPartnerName = (partnerId, partnerType) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return null;
    
    if (partnerType === 'business') {
      const businessInfo = extractBusinessInfo(partner.notes);
      return businessInfo.Business || partner.website;
    }
    return partner.website;
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(id);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const deleteLink = async (id) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        setDeleteStatus({ inProgress: true, id });
        await AffiliateLink.delete(id);
        setError(null);
        onUpdate();
      } catch (error) {
        console.error('Error deleting link:', error);
        setError("There was an error deleting this link. Please try again later.");
      } finally {
        setDeleteStatus({ inProgress: false, id: null });
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onUpdate}>Try Again</Button>
      </Card>
    );
  }

  if (links.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500 mb-4">No affiliate links created yet</p>
        <Link to={createPageUrl("CreateLink")}>
          <Button>Create Your First Link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => {
        const isDeleting = deleteStatus.inProgress && deleteStatus.id === link.id;
        const partnerName = getPartnerName(link.partner_id, link.partner_type);
        
        return (
          <Card key={link.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {link.title || "Untitled Link"}
                  </h3>
                  <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                    {link.status}
                  </Badge>
                  {link.partner_type && (
                    <Badge className={
                      link.partner_type === 'business' 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }>
                      {link.partner_type}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-700">Your Affiliate Link:</p>
                  <code className="text-sm bg-gray-50 p-2 rounded-lg break-all">
                    {link.dub_short_url}
                  </code>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span>{format(new Date(link.created_date), 'MMM d, yyyy')}</span>
                  {link.campaign && link.campaign !== "default" && (
                    <span>Campaign: {link.campaign}</span>
                  )}
                  {partnerName && (
                    <span>Partner: {partnerName}</span>
                  )}
                  {link.tags && link.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {link.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <a 
                    href={link.original_url} 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Original URL
                  </a>
                </div>

                {/* Simple Stats Section (not relying on Dub API) */}
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Clicks</p>
                    <p className="text-xl font-semibold">{link.click_count || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-semibold">{format(new Date(link.created_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-sm font-semibold capitalize">{link.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(link.dub_short_url, link.id)}
                  title="Copy affiliate link"
                >
                  {copySuccess === link.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <a 
                  href={link.dub_short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  title="Test your affiliate link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!link.dub_link_id}
                  onClick={() => {
                    if (link.dub_link_id) {
                      const newWindow = window.open('https://dub.co/analytics/' + link.dub_link_id, '_blank');
                      if (newWindow) newWindow.focus();
                    }
                  }}
                  title="View detailed analytics"
                >
                  <BarChart className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteLink(link.id)}
                  disabled={isDeleting}
                  title="Delete link"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
