import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Link2, Copy, AlertCircle, Check } from "lucide-react";
import { RedirectLink } from "@/api/entities";
import { User } from "@/api/entities";

function generateUniqueId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateLinkForm() {
  const [formData, setFormData] = useState({
    destination_url: '',
    campaign_id: ''
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      // Validate URL
      if (!formData.destination_url.startsWith('http://') && !formData.destination_url.startsWith('https://')) {
        formData.destination_url = 'https://' + formData.destination_url;
      }
      new URL(formData.destination_url);

      const unique_id = generateUniqueId();
      const affiliate_id = user?.email || 'anonymous';

      // Create redirect link
      const linkData = {
        unique_id,
        destination_url: formData.destination_url,
        campaign_id: formData.campaign_id || null,
        affiliate_id,
        total_clicks: 0,
        status: 'active'
      };

      await RedirectLink.create(linkData);

      // Generate the full redirect URL
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/r/${unique_id}${formData.campaign_id ? `?campaign=${formData.campaign_id}` : ''}`;

      setGeneratedLink(redirectUrl);
    } catch (error) {
      setError('Please enter a valid URL');
      console.error("Error creating link:", error);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-black p-2 rounded-lg">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Create Affiliate Link</h1>
          <p className="text-gray-500">Generate a new tracking link for your marketing</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="destination_url">Destination URL</Label>
          <Input
            id="destination_url"
            placeholder="https://example.com/product"
            value={formData.destination_url}
            onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="campaign_id">Campaign ID (optional)</Label>
          <Input
            id="campaign_id"
            placeholder="spring_sale"
            value={formData.campaign_id}
            onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-black hover:bg-gray-800"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating Link..." : "Generate Affiliate Link"}
        </Button>
      </form>

      {generatedLink && (
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <Label>Your Affiliate Link</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedLink)}
                className="h-8 px-2"
              >
                {copySuccess ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <code className="block p-2 bg-white rounded border text-sm break-all">
              {generatedLink}
            </code>
          </div>

          <p className="text-sm text-gray-500">
            This link will track clicks and redirect users to your destination URL
          </p>
        </div>
      )}
    </Card>
  );
}