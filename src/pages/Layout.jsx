

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Link2, Users, Info, Bell, User as UserIcon, Settings, ChevronDown, X, Menu, LogOut, Building } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User } from "@/api/entities";
import { Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();
  const isRedirectPage = location.pathname.includes('/redirect/');

  // Load user data with retries and exponential backoff
  React.useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await User.me();
      setUser(userData);
      setError(null);
      console.log("Layout - Current user:", userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      // Only set error if we've tried at least twice
      if (retryCount >= 2) {
        setError({
          title: "Connection Error",
          message: "We're having trouble connecting to our servers. Please check your internet connection."
        });
      } else {
        // Retry with exponential backoff
        const timeout = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${timeout}ms (attempt ${retryCount + 1})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchUser();
        }, timeout);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add fallback error UI
  if (error && !isRedirectPage && !user && !isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">{error.title || "Connection Error"}</h2>
          </div>
          <p className="mb-6 text-gray-600">{error.message || "We're having trouble connecting to our servers. Please try refreshing the page."}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  const handleRefresh = () => {
    setRetryCount(0);
    fetchUser();
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
      // If logout fails, force a page reload
      window.location.href = "/";
    }
  };

  // If we're on a redirect page, just render the children directly without layout
  if (isRedirectPage) {
    return <>{children}</>;
  }

  const navigationItems = [
    { name: "Dashboard", href: createPageUrl("Dashboard"), icon: BarChart },
    { name: "Create Link", href: createPageUrl("CreateLink"), icon: Link2 },
    { name: "Partnerships", href: createPageUrl("Partnerships"), icon: Users },
    { name: "Business Partners", href: createPageUrl("BusinessPartnership"), icon: Building },
    // Always show Directory if user is logged in
    { name: "Directory", href: createPageUrl("BusinessDirectory"), icon: Search },
    // Only show Admin Panel for davidwigbert@gmail.com
    user?.email === "davidwigbert@gmail.com" && { name: "Admin Panel", href: createPageUrl("AdminPanel"), icon: Settings },
    { name: "About", href: createPageUrl("About"), icon: Info },
  ].filter(Boolean); // Remove null/undefined items

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      <header className="bg-white backdrop-blur-lg bg-opacity-80 border-b border-[#E5E5EA] sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <div className="bg-black rounded-xl p-1.5">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-black">affiliateaura.co</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navigationItems.map(item => (
              <Link 
                key={item.name}
                to={item.href} 
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  currentPageName === item.name
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                )}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Profile dropdown */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={user?.full_name || "User"} />
                    <AvatarFallback>{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Show connection warning if there was a problem that recovered */}
      {retryCount > 0 && !error && user && (
        <div className="container mx-auto px-4 mt-2">
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              There was a temporary connection issue that has been resolved.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}  
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs p-6 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-black rounded-xl p-1.5">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-xl">affiliateaura.co</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-2">
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 rounded-lg",
                    currentPageName === item.name
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatars/01.png" alt={user?.full_name || "User"} />
                  <AvatarFallback>{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      <footer className="bg-white py-8 border-t border-[#E5E5EA]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                <div className="bg-black rounded-xl p-1.5">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-xl">affiliateaura.co</span>
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                The simplest way to generate, track, and optimize your affiliate links.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                {navigationItems.map(item => (
                  <li key={item.name}>
                    <Link 
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-black"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-black">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-black">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            © {new Date().getFullYear()} affiliateaura.co. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

