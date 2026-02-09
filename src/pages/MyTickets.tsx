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
import { Loader2, MessageSquare, Plus, Send, Search, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
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

  // Fetch tickets where the LAST reply is from admin (awaiting user response)
  const { data: ticketsAwaitingUserReply, refetch: refetchAwaitingReplies } = useQuery({
    queryKey: ["ticketsAwaitingUserReply"],
    queryFn: async () => {
      // Get the latest reply for each ticket
      const { data, error } = await supabase
        .from("support_ticket_replies")
        .select("ticket_id, is_admin_reply, created_at")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Group by ticket and check if latest reply is from admin
      const latestReplyByTicket = new Map<string, boolean>();
      data?.forEach(reply => {
        if (!latestReplyByTicket.has(reply.ticket_id)) {
          latestReplyByTicket.set(reply.ticket_id, reply.is_admin_reply || false);
        }
      });
      
      // Return set of ticket IDs where last reply is from admin
      const awaitingReply = new Set<string>();
      latestReplyByTicket.forEach((isAdminReply, ticketId) => {
        if (isAdminReply) awaitingReply.add(ticketId);
      });
      
      return awaitingReply;
    },
    enabled: !!tickets && tickets.length > 0,
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
    setTimeout(() => {
      refetchReplies();
      refetchAwaitingReplies(); // Refresh the badge status after user replies
    }, 500);
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
                      <div className="flex items-center gap-2">
                        {ticket.status !== "resolved" && ticket.status !== "closed" && ticketsAwaitingUserReply?.has(ticket.id) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Replied
                          </Badge>
                        )}
                        {getStatusBadge(ticket.status)}
                      </div>
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
        <DialogContent className="max-w-2xl h-[90vh] sm:h-[80vh] p-0 flex flex-col gap-0 sm:rounded-lg rounded-none sm:max-h-[80vh] max-h-[100dvh] w-full sm:w-auto [&>button]:z-50">
          {selectedTicket && (
            <div className="flex flex-col h-full min-h-0">
              {/* Compact Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30 shrink-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate pr-6">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusBadge(selectedTicket.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(selectedTicket.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-3">
                  {/* Original message */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium">
                      You
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                        <p className="text-sm whitespace-pre-wrap break-words">{selectedTicket.message}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                        {format(new Date(selectedTicket.created_at), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {repliesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : replies && replies.length > 0 ? (
                    replies.map((reply) => (
                      <div key={reply.id} className={`flex gap-2 ${reply.is_admin_reply ? "" : "flex-row-reverse"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium ${
                          reply.is_admin_reply ? "bg-primary/15 text-primary" : "bg-muted"
                        }`}>
                          {reply.is_admin_reply ? "S" : "You"}
                        </div>
                        <div className={`flex-1 min-w-0 ${reply.is_admin_reply ? "" : "flex flex-col items-end"}`}>
                          <div className={`rounded-2xl px-3 py-2 max-w-[85%] ${
                            reply.is_admin_reply
                              ? "bg-primary/10 rounded-tl-sm"
                              : "bg-muted rounded-tr-sm"
                          }`}>
                            {reply.is_admin_reply && (
                              <p className="text-[10px] font-semibold text-primary mb-0.5">Support Team</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{reply.message}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 mx-1">
                            {format(new Date(reply.created_at), "MMM d 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      No replies yet
                    </p>
                  )}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <div className="border-t px-3 py-2 shrink-0 bg-background">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl"
                      rows={1}
                    />
                    <Button 
                      size="icon"
                      onClick={handleSendReply}
                      disabled={isAddingReply || !replyMessage.trim()}
                      className="shrink-0 rounded-full h-9 w-9"
                    >
                      {isAddingReply ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
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
