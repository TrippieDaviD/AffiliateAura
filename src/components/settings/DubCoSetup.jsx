import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { User } from "@/api/entities";

export default function DubCoSetup() {
  const [settings, setSettings] = useState({
    enabled: false
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await User.me();
      if (user?.dub_integration) {
        setSettings({
          enabled: user.dub_integration.enabled || false
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    setStatus({ loading: true, error: null, success: false });
    
    try {
      // Save settings to user profile
      await User.updateMyUserData({
        dub_integration: {
          enabled: settings.enabled
        }
      });

      setStatus({ loading: false, error: null, success: true });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Shortening Integration</CardTitle>
        <CardDescription>
          Enable professional link shortening with advanced analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable Link Shortening</h3>
            <p className="text-sm text-gray-500">Use professional short links for all your affiliate links</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Our platform uses dub.co for link shortening. You don't need to create a separate account - we've taken care of everything for you!
          </AlertDescription>
        </Alert>

        {status.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}

        {status.success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSave}
          disabled={status.loading}
          className="w-full"
        >
          {status.loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}