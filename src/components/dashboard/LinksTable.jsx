import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, Plus, Trash2, Edit2, Check, Eye } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { AffiliateLink } from "@/api/entities";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function LinksTable({ affiliateLinks, isLoading, onUpdate }) {
  const [selectedLink, setSelectedLink] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  const baseUrl = window.location.origin;

  const generateRedirectUrl = (uniqueId) => {
    return `${baseUrl}/go/${uniqueId}`;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const handleDelete = async () => {
    if (!selectedLink) return;
    
    setIsDeleting(true);
    try {
      await AffiliateLink.delete(selectedLink.id);
      setShowDeleteDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting link:", error);
    }
    setIsDeleting(false);
  };

  const showLinkDetails = (link) => {
    setSelectedLink(link);
    setShowLinkDialog(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (affiliateLinks.length === 0) {
    return (
      <Card className="p-6 text-center rounded-xl">
        <p className="text-gray-500 mb-4">No affiliate links yet</p>
        <Link to={createPageUrl("CreateLink")}>
          <Button className="bg-black hover:bg-gray-800 text-white">Create Your First Link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        <div className="flex justify-end p-4">
          <Link to={createPageUrl("CreateLink")}>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Link
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title/URL</TableHead>
                <TableHead>Affiliate Link</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateLinks.map((link) => {
                const redirectUrl = generateRedirectUrl(link.unique_id);
                
                return (
                  <TableRow key={link.id} className="group">
                    <TableCell>
                      <div>
                        <div className="font-medium">{link.title || "Untitled Link"}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          <a 
                            href={link.original_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-black"
                          >
                            {link.original_url}
                          </a>
                        </div>
                        {link.tags && link.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {link.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="text-sm text-gray-700 truncate max-w-[150px] cursor-pointer"
                          onClick={() => showLinkDetails(link)}
                        >
                          {redirectUrl}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-6 w-6"
                          onClick={() => copyToClipboard(redirectUrl, link.id)}
                        >
                          {copySuccess === link.id ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50">
                        {link.campaign || "default"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{link.click_count || 0}</div>
                      {link.conversion_count > 0 && (
                        <div className="text-xs text-gray-500">
                          {link.conversion_count} conversions
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {link.created_date ? format(new Date(link.created_date), 'MMM d, yyyy') : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem 
                            onClick={() => showLinkDetails(link)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => copyToClipboard(redirectUrl, link.id)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(link.original_url, '_blank')}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>Visit Original URL</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(redirectUrl, '_blank')}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>Test Affiliate Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => {
                              setSelectedLink(link);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Affiliate Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this affiliate link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLink && (
            <div className="py-2">
              <div className="font-medium">{selectedLink.title || "Untitled Link"}</div>
              <div className="text-sm text-gray-500 truncate">{selectedLink.original_url}</div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg"
            >
              {isDeleting ? "Deleting..." : "Delete Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link details dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Affiliate Link Details</DialogTitle>
          </DialogHeader>
          
          {selectedLink && (
            <div className="py-2 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
                <p className="font-medium">{selectedLink.title || "Untitled Link"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Original URL</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    value={selectedLink.original_url}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedLink.original_url, 'orig-url')}
                    className="flex-shrink-0"
                  >
                    {copySuccess === 'orig-url' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Your Affiliate Link</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    value={generateRedirectUrl(selectedLink.unique_id)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generateRedirectUrl(selectedLink.unique_id), 'aff-url')}
                    className="flex-shrink-0"
                  >
                    {copySuccess === 'aff-url' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this link with your audience to track clicks and earn commissions
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign</h3>
                  <p>{selectedLink.campaign || "default"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p>{selectedLink.created_date ? format(new Date(selectedLink.created_date), 'MMM d, yyyy') : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Clicks</h3>
                  <p>{selectedLink.click_count || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Conversions</h3>
                  <p>{selectedLink.conversion_count || 0}</p>
                </div>
              </div>
              
              {selectedLink.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-sm">{selectedLink.description}</p>
                </div>
              )}
              
              {selectedLink.tags && selectedLink.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedLink.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowLinkDialog(false)}
              className="rounded-lg"
            >
              Close
            </Button>
            <Button 
              type="button"
              className="bg-black text-white rounded-lg"
              onClick={() => {
                if (selectedLink) {
                  window.open(generateRedirectUrl(selectedLink.unique_id), '_blank');
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}