
import React, { useState, useEffect } from "react";
import { Partnership } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities";

export default function Partnerships() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    website: "",
    contact_email: "",
    notes: "",
    commission_rate: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
    setIsSending(true);
    setError("");

    try {
      // Validate email
      if (!formData.contact_email.includes('@')) {
        throw new Error("Please enter a valid email address");
      }

      // Create partnership record
      const partnershipData = {
        ...formData,
        status: "pending",
        last_contact_date: new Date().toISOString().split('T')[0]
      };
      
      await Partnership.create(partnershipData);

      // Send email to potential partner
      await SendEmail({
        to: formData.contact_email,
        subject: "New Partnership Opportunity from affiliateaura.co",
        body: `
Hello,

I'm ${user?.full_name || "a user"} from affiliateaura.co and I'm interested in partnering with ${formData.website} through our affiliate program.

We're offering a ${formData.commission_rate}% commission rate for successful referrals.

Additional notes:
${formData.notes}

Looking forward to your response!

Best regards,
${user?.full_name || ""}
affiliateaura.co
        `
      });

      // Get user's current notification preferences
      if (user && user.email) {
        // Send notification to the requester if they have enabled partnership notifications
        const userPreferences = user.notification_preferences || {};
        
        if (userPreferences.email_new_partnership !== false) {
          await SendEmail({
            to: user.email,
            subject: "Your Partnership Request on affiliateaura.co",
            body: `
Hello ${user.full_name},

This is a confirmation that your partnership request to ${formData.website} has been sent successfully.

Partnership details:
- Website: ${formData.website}
- Contact: ${formData.contact_email}
- Commission Rate: ${formData.commission_rate}%
- Date Requested: ${new Date().toLocaleDateString()}

You can view and manage all your partnerships from your dashboard.

Best regards,
The affiliateaura.co Team
            `
          });
        }
      }

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error creating partnership:", error);
      setError(error.message || "Error sending partnership request. Please try again.");
    }

    setIsSending(false);
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
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Request Partnership</h1>
            <p className="text-gray-500">Reach out to potential partners for your affiliate marketing</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="partner@example.com"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="commission_rate">Proposed Commission Rate (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              placeholder="10"
              value={formData.commission_rate}
              onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Introduce yourself and explain why you'd be a great partner..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-32 rounded-lg"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800 text-white rounded-xl" 
            disabled={isSending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Sending Request..." : "Send Partnership Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
