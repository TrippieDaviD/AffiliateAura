import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { User } from "@/api/entities";
import { DubCoService } from '../services/DubCoService';

export default function DubCoIntegrationModal({ isOpen, onClose, onSuccess }) {
  const [apiKey, setApiKey] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    if (!apiKey || !workspace) {
      setError("Please provide both API key and workspace name");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Test if the credentials are valid
      const testResult = await DubCoService.testCredentials(apiKey, workspace);
      
      if (!testResult.success) {
        throw new Error(testResult.error || "Could not connect to dub.co with these credentials");
      }
      
      // Save dub.co settings to user profile
      await User.updateMyUserData({
        integration: {
          use_dub_co: true,
          dub_api_key: apiKey,
          dub_workspace: workspace
        }
      });
      
      setSuccess(true);
      
      // If success callback was provided, call it
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      // Close the modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error connecting to dub.co:", error);
      setError(error.message || "Failed to connect to dub.co. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Connect to dub.co</DialogTitle>
          <DialogDescription>
            Configure your dub.co integration for advanced link tracking and custom domains.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dub-api-key">dub.co API Key</Label>
            <Input
              id="dub-api-key"
              type="password"
              placeholder="dub_XXXXXXXXXXXXXXXX"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">You can find your API key in your dub.co account settings</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dub-workspace">Workspace Name</Label>
            <Input
              id="dub-workspace"
              placeholder="your-workspace"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            />
            <p className="text-xs text-gray-500">Enter your workspace slug (e.g., for your-workspace.dub.co, enter "your-workspace")</p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Successfully connected to dub.co!</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">How to set up dub.co</h3>
            <ol className="list-decimal text-sm text-blue-700 pl-5 space-y-1">
              <li>Create a <a href="https://dub.co" target="_blank" rel="noopener noreferrer" className="underline">dub.co account</a> (Pro plan or higher)</li>
              <li>Go to your account settings</li>
              <li>Create a new API key with full access</li>
              <li>Copy and paste the API key and your workspace name here</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            className="bg-black text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}