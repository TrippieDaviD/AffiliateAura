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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ExternalLink, Mail, Plus, Send, Check, X, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { SendEmail } from "@/api/integrations";
import { Partnership } from "@/api/entities";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
  pending_review: "bg-purple-100 text-purple-800 border-purple-200"
};

export default function PartnershipsTable({ partnerships, isLoading, onUpdate, isAdmin }) {
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleApprove = async (partnership) => {
    if (!isAdmin) return;
    
    try {
      await Partnership.update(partnership.id, { status: 'active' });
      
      // Send approval email
      await SendEmail({
        to: partnership.contact_email,
        subject: "Your Partnership Request has been Approved",
        body: `
Hello,

Your partnership request for ${partnership.website} has been approved! 
You can now access our business directory and start creating affiliate links.

Best regards,
AffiliateAura Team
        `
      });
      
      onUpdate();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error approving partnership:", error);
    }
  };

  const handleReject = async (partnership) => {
    if (!isAdmin) return;
    
    try {
      await Partnership.update(partnership.id, { status: 'rejected' });
      
      // Send rejection email
      await SendEmail({
        to: partnership.contact_email,
        subject: "Update on Your Partnership Request",
        body: `
Hello,

We've reviewed your partnership request for ${partnership.website}.
Unfortunately, we cannot approve your request at this time.

Best regards,
AffiliateAura Team
        `
      });
      
      onUpdate();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error rejecting partnership:", error);
    }
  };

  const extractBusinessInfo = (notes) => {
    if (!notes) return {};
    
    const info = {};
    const lines = notes ? notes.split('\n') : [];
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
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

  if (!partnerships || partnerships.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500 mb-4">No partnerships found</p>
        <Link to={createPageUrl("Partnerships")}>
          <Button className="bg-black hover:bg-gray-800">Request New Partnership</Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerships.map((partnership) => (
                <TableRow key={partnership.id}>
                  <TableCell>{partnership.website}</TableCell>
                  <TableCell>{partnership.contact_email}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${statusColors[partnership.status]} cursor-pointer`}
                      onClick={() => {
                        setSelectedPartnership(partnership);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {partnership.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{partnership.partner_type || 'affiliate'}</TableCell>
                  <TableCell>{format(new Date(partnership.created_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPartnership(partnership);
                          setIsDetailsOpen(true);
                        }}
                      >
                        Details
                      </Button>
                      {isAdmin && (partnership.status === 'pending' || partnership.status === 'pending_review') && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(partnership)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(partnership)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Partnership Details Dialog */}
      {selectedPartnership && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Partnership Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedPartnership.partner_type === "business" 
                      ? extractBusinessInfo(selectedPartnership.notes).Business || "Business Partner" 
                      : "Affiliate Partner"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={statusColors[selectedPartnership.status]}>
                      {selectedPartnership.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedPartnership.partner_type || "affiliate"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedPartnership.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" /> Visit Site
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Contact Information</h4>
                  <p className="mt-1">{selectedPartnership.contact_email}</p>
                  {selectedPartnership.partner_type === "business" && extractBusinessInfo(selectedPartnership.notes).Contact && (
                    <p className="mt-1">{extractBusinessInfo(selectedPartnership.notes).Contact}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Website</h4>
                  <p className="mt-1 break-all">{selectedPartnership.website}</p>
                </div>
                
                {selectedPartnership.commission_rate && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Commission Rate</h4>
                    <p className="mt-1">{selectedPartnership.commission_rate}%</p>
                  </div>
                )}
              </div>
              
              {selectedPartnership.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Additional Information</h4>
                    <p className="mt-1 whitespace-pre-line">{selectedPartnership.notes}</p>
                  </div>
                </>
              )}
              
              {isAdmin && (selectedPartnership.status === 'pending' || selectedPartnership.status === 'pending_review') && (
                <>
                  <Separator />
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(selectedPartnership)}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedPartnership)}
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}