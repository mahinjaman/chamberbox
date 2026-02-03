import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupportTickets, SupportTicket, TicketReply } from "@/hooks/useSupportTickets";
import { Loader2, MessageSquare, Plus, Send, Search } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function MyTickets() {
  const { profile } = useProfile();
  const { 
    tickets, 
    ticketsLoading, 
    fetchTicketReplies,
    createTicket,
    addReply,
    isCreating,
    isAddingReply,
  } = useSupportTickets();
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    category: "general",
  });

  // Filter to only show user's own tickets with search and status filter
  const myTickets = tickets?.filter(t => {
    // Only user's tickets
    if (t.user_email !== profile?.email) return false;
    
    // Status filter
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        t.subject.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const { data: replies, isLoading: repliesLoading, refetch: refetchReplies } = useQuery({
    queryKey: ["ticketReplies", selectedTicket?.id],
    queryFn: () => fetchTicketReplies(selectedTicket!.id),
    enabled: !!selectedTicket?.id,
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    addReply({ ticketId: selectedTicket.id, message: replyMessage });
    setReplyMessage("");
    setTimeout(() => refetchReplies(), 500);
  };

  const handleCreateTicket = () => {
    createTicket(newTicket);
    setIsNewTicketOpen(false);
    setNewTicket({ subject: "", message: "", category: "general" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      open: "destructive",
      in_progress: "default",
      resolved: "secondary",
      closed: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <DashboardLayout
      title="My Support Tickets"
      description="View and manage your support requests"
      actions={
        <Button onClick={() => setIsNewTicketOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Your Tickets</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : myTickets && myTickets.length > 0 ? (
            <div className="space-y-3">
              {myTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {ticket.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(ticket.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No support tickets yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsNewTicketOpen(true)}
              >
                Create Your First Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedTicket.status)}
                <span className="text-sm text-muted-foreground">
                  Created {format(new Date(selectedTicket.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              <ScrollArea className="h-[200px] border rounded-lg p-4">
                {repliesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : replies && replies.length > 0 ? (
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className={`p-3 rounded-lg ${
                          reply.is_admin_reply 
                            ? "bg-primary/10 ml-4" 
                            : "bg-muted mr-4"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">
                          {reply.is_admin_reply ? "Support Team" : "You"}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(reply.created_at), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No replies yet
                  </p>
                )}
              </ScrollArea>

              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSendReply}
                    disabled={isAddingReply || !replyMessage.trim()}
                    className="self-end"
                  >
                    {isAddingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={newTicket.category} 
                onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief summary of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={isCreating || !newTicket.subject.trim() || !newTicket.message.trim()}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
