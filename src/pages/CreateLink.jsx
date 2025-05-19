
import React, { useState, useEffect } from "react";
import { AffiliateLink } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink, Link2, AlertCircle, Check, Info } from "lucide-react";
import { createPageUrl, extractBusinessInfo } from "@/utils"; // Updated import path
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Partnership } from "@/api/entities";

export default function CreateLink() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    original_url: "",
    description: "",
    campaign: "",
    tags: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [copyStatus, setCopyStatus] = useState({
    original: false,
    affiliate: false
  });
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [availablePartners, setAvailablePartners] = useState([]);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const activePartnerships = await Partnership.filter({ status: 'active' });
      console.log("Loaded active partnerships:", activePartnerships);
      setAvailablePartners(activePartnerships || []);
    } catch (error) {
      console.error("Error loading partners:", error);
      // Don't fail completely if partners can't be loaded
      setAvailablePartners([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWarning('');
    setIsGenerating(true);

    try {
      // Validate and format URL
      let normalizedUrl = formData.original_url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // For demo/example purposes, use predefined link
      let selectedLink = { id: 'MWRpaD5', url: 'https://go.affiliateaura.co/MWRpaD5' };

      // Check if this is futjersey.net
      if (normalizedUrl.includes('futjersey.net')) {
        // Randomly select between the two affiliate links
        const futjerseyLinks = [
          {
            id: 'MWRpaD5',
            url: 'https://go.affiliateaura.co/MWRpaD5'
          },
          {
            id: 'hfjzDrf',
            url: 'https://go.affiliateaura.co/hfjzDrf'
          }
        ];
        
        // Random selection (0 or 1)
        const randomIndex = Math.floor(Math.random() * 2);
        selectedLink = futjerseyLinks[randomIndex];
      }

      // Parse tags into an array
      let tagsArray = [];
      if (formData.tags) {
        tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }

      const linkData = {
        title: formData.title || 'Affiliate Link',
        description: formData.description || "",
        original_url: normalizedUrl,
        dub_link_id: selectedLink.id,
        dub_short_url: selectedLink.url,
        campaign: formData.campaign || "default",
        tags: tagsArray,
        status: 'active',
        partner_id: selectedPartner?.id || null,
        partner_type: selectedPartner?.partner_type || null
      };

      console.log("Creating new link with data:", linkData);
      const newLink = await AffiliateLink.create(linkData);
      console.log('Created affiliate link:', newLink);
      
      setGeneratedLink({
        original: normalizedUrl,
        affiliate: selectedLink.url,
        title: linkData.title
      });
    } catch (error) {
      console.error("Error creating link:", error);
      setError(error.message || 'Failed to create link. Please try again.');
    }

    setIsGenerating(false);
  };

  const copyToClipboard = (text, type) => {
    try {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopyStatus({ ...copyStatus, [type]: true });
          setTimeout(() => {
            setCopyStatus({ ...copyStatus, [type]: false });
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    } catch (error) {
      console.error("Copy to clipboard error:", error);
    }
  };

  const handleGoToDashboard = () => {
    // Force reload dashboard data by adding a timestamp parameter
    navigate(createPageUrl("Dashboard") + "?refresh=" + Date.now());
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(createPageUrl("Dashboard"))}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="p-6 border-none shadow-sm rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-black p-2 rounded-lg">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create Affiliate Link</h1>
            <p className="text-gray-500">Generate a new tracking link for your marketing</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {warning && (
          <Alert variant="warning" className="mb-6 bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 mr-2 text-yellow-500" />
            <AlertDescription className="text-yellow-700">{warning}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="original_url">Original URL</Label>
            <Input
              id="original_url"
              placeholder="https://example.com/product"
              value={formData.original_url}
              onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
              required
              className="rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              The destination URL you want to create an affiliate link for
            </p>
          </div>

          <div>
            <Label htmlFor="title">Link Title</Label>
            <Input
              id="title"
              placeholder="Summer Sale Product"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              A name to help you identify this link (optional)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this link..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                placeholder="summer_2023"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                For tracking different marketing campaigns
              </p>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="fashion, sale, discount"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="partner">Associate with Partner (Optional)</Label>
            <Select
              value={selectedPartner?.id || ""}
              onValueChange={(value) => {
                if (!value || value === "none") {
                  setSelectedPartner(null);
                  return;
                }
                const partner = availablePartners.find(p => p.id === value);
                setSelectedPartner(partner || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Partner</SelectItem>
                {availablePartners.map(partner => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.partner_type === 'business' 
                      ? extractBusinessInfo(partner.notes).Business || partner.website
                      : partner.website}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800 text-white rounded-xl" 
            disabled={isGenerating}
          >
            {isGenerating ? "Generating Link..." : "Generate Affiliate Link"}
          </Button>
        </form>

        {generatedLink && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <Label className="text-sm text-gray-500">Original URL</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink.original, 'original')}
                  className="rounded-full"
                >
                  {copyStatus.original ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="break-all text-sm">{generatedLink.original}</div>
            </div>

            <div className="p-4 bg-gray-100 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Label className="text-sm text-black font-medium">Your Affiliate Link</Label>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 border-none">AffiliateAura</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedLink.affiliate, 'affiliate')}
                    className="rounded-full"
                    title="Copy to clipboard"
                  >
                    {copyStatus.affiliate ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(generatedLink.affiliate, '_blank')}
                    className="rounded-full"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="break-all text-sm font-medium">{generatedLink.affiliate}</div>
              <p className="text-xs text-gray-500 mt-2">
                This link includes professional analytics and tracking
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <Button 
                onClick={() => setGeneratedLink(null)}
                variant="outline"
                className="rounded-xl"
              >
                Create Another Link
              </Button>
              <Button 
                onClick={handleGoToDashboard}
                className="bg-black text-white rounded-xl"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
