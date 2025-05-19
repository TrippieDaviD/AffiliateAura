
import React, { useState, useEffect } from "react";
import { Partnership } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building, Check, Info, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SendEmail } from "@/api/integrations";
import { Badge } from "@/components/ui/badge";

export default function BusinessPartnership() {
  const [formData, setFormData] = useState({
    business_name: "",
    website: "",
    contact_email: "",
    contact_name: "",
    product_description: "",
    commission_offer: "",
    additional_info: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [approvedPartners, setApprovedPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load approved business partners
  useEffect(() => {
    loadApprovedPartners();
  }, []);

  const loadApprovedPartners = async () => {
    try {
      setIsLoading(true);
      const partnerships = await Partnership.filter({
        partner_type: "business",
        status: "active"
      });
      setApprovedPartners(partnerships);
    } catch (error) {
      console.error("Error loading business partners:", error);
    } finally {
      setIsLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      // Validate email
      if (!formData.contact_email.includes('@')) {
        throw new Error("Please enter a valid email address");
      }
      
      // Validate website
      let website = formData.website;
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website;
      }
      
      try {
        new URL(website);
      } catch (e) {
        throw new Error("Please enter a valid website URL");
      }
      
      // Create partnership record
      const partnershipData = {
        website: website,
        contact_email: formData.contact_email,
        status: "pending_review",
        partner_type: "business", // Make sure to set the partner type
        notes: `Business: ${formData.business_name}
Contact: ${formData.contact_name}
Product: ${formData.product_description}
Commission offer: ${formData.commission_offer}
Additional info: ${formData.additional_info}`,
        last_contact_date: new Date().toISOString().split('T')[0]
      };
      
      // Store in the database
      await Partnership.create(partnershipData);
      
      // Send notification email to admin
      try {
        await SendEmail({
          to: "admin@affiliateaura.co", // Replace with your admin email
          subject: "New Business Partnership Request",
          body: `
New partnership request received:

Business name: ${formData.business_name}
Website: ${website}
Contact: ${formData.contact_name} (${formData.contact_email})
Product description: ${formData.product_description}
Commission offer: ${formData.commission_offer}
Additional info: ${formData.additional_info}

Please review this request in the admin dashboard.
          `
        });
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
      }
      
      // Send confirmation email to business
      try {
        await SendEmail({
          to: formData.contact_email,
          subject: "Your Partnership Request with AffiliateAura",
          body: `
Hello ${formData.contact_name},

Thank you for your interest in partnering with AffiliateAura. We have received your partnership request and will review it shortly.

Here's a summary of your submission:
- Business name: ${formData.business_name}
- Website: ${website}
- Product description: ${formData.product_description}
- Commission offer: ${formData.commission_offer}

We'll be in touch with you soon to discuss the next steps. If you have any questions in the meantime, please feel free to reply to this email.

Best regards,
The AffiliateAura Team
          `
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
      
      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting partnership request:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    }
    
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Partner With AffiliateAura</h1>
        <p className="text-gray-600">
          Join our affiliate network and grow your business with our community of marketers
        </p>
      </div>
      
      {success ? (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Partnership Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in partnering with us. We've received your request and 
              will review it shortly. You'll receive a confirmation email with details.
            </p>
            <div className="flex gap-4">
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
              <Link to={createPageUrl("About")}>
                <Button variant="default">Learn More About Us</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 shadow-sm border-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-black p-2 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Partnership Application</h2>
              <p className="text-gray-500">Register your business to be featured in our affiliate program</p>
            </div>
          </div>
          
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Once approved, your products will be available for our affiliate marketers to promote
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  placeholder="Your Company Ltd."
                  required
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Business Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://yourbusiness.com"
                  required
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="John Smith"
                  required
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="contact@yourbusiness.com"
                  required
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="product_description">Product or Service Description</Label>
              <Textarea
                id="product_description"
                value={formData.product_description}
                onChange={(e) => setFormData({...formData, product_description: e.target.value})}
                placeholder="Describe the products or services you'd like our affiliates to promote"
                required
                rows={4}
                className="rounded-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="commission_offer">Commission Structure</Label>
              <Input
                id="commission_offer"
                value={formData.commission_offer}
                onChange={(e) => setFormData({...formData, commission_offer: e.target.value})}
                placeholder="e.g. 10% per sale, $5 per lead, etc."
                required
                className="rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">Describe the commission structure you're offering to affiliates</p>
            </div>
            
            <div>
              <Label htmlFor="additional_info">Additional Information</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData({...formData, additional_info: e.target.value})}
                placeholder="Any other details you'd like to share about your partnership opportunity"
                rows={3}
                className="rounded-lg"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800 text-white rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Submit Partnership Request
                </>
              )}
            </Button>
          </form>
        </Card>
      )}
      
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Why Partner With Us?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-medium mb-2">Expand Your Reach</h3>
            <p className="text-sm text-gray-600">Access our network of affiliate marketers to reach new audiences</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-medium mb-2">Performance-Based</h3>
            <p className="text-sm text-gray-600">Only pay for results - sales, leads, or actions that matter to you</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-medium mb-2">Simple Management</h3>
            <p className="text-sm text-gray-600">Track and manage all your affiliate partnerships in one place</p>
          </div>
        </div>
      </div>

      {/* Display Approved Business Partners */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Our Business Partners</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </Card>
            ))}
          </div>
        ) : approvedPartners.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No approved business partners yet
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedPartners.map((partner) => {
              const businessInfo = extractBusinessInfo(partner.notes);
              return (
                <Card key={partner.id} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{businessInfo.Business}</h3>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {partner.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active Partner
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {businessInfo.Product}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Commission Structure:</span>
                      <span className="font-medium">{businessInfo['Commission offer']}</span>
                    </div>
                    
                    {businessInfo.Category && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <Badge variant="outline">{businessInfo.Category}</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Link to={createPageUrl("BusinessDirectory")}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
