import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Link2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DubCoSetup from "../components/settings/DubCoSetup";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_new_click: true,
    email_new_partnership: true,
    email_weekly_report: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        // Initialize notification preferences from user data if available
        if (userData?.notification_preferences) {
          setNotificationPreferences(userData.notification_preferences);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");
    
    try {
      // Update user data with new notification preferences
      await User.updateMyUserData({
        notification_preferences: notificationPreferences
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    }
    
    setSaving(false);
  };

  const handleNotificationChange = (key, value) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: value
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(createPageUrl("Dashboard"))}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Settings saved successfully!</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage what notifications you receive via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Link Click Notifications</p>
                  <p className="text-sm text-gray-500">Get notified when someone clicks on your affiliate links</p>
                </div>
                <Switch 
                  checked={notificationPreferences.email_new_click}
                  onCheckedChange={(checked) => handleNotificationChange("email_new_click", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Partnership Notifications</p>
                  <p className="text-sm text-gray-500">Get notified about new partnership requests and responses</p>
                </div>
                <Switch 
                  checked={notificationPreferences.email_new_partnership}
                  onCheckedChange={(checked) => handleNotificationChange("email_new_partnership", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-gray-500">Receive a weekly summary of your affiliate performance</p>
                </div>
                <Switch 
                  checked={notificationPreferences.email_weekly_report}
                  onCheckedChange={(checked) => handleNotificationChange("email_weekly_report", checked)}
                />
              </div>
              
              <Button 
                onClick={handleSaveNotifications} 
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <DubCoSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}