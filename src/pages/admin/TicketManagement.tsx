import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupportTickets, SupportTicket, TicketReply } from "@/hooks/useSupportTickets";
import { Search, Loader2, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];

export default function TicketManagement() {
  const queryClient = useQueryClient();
  const { 
    tickets, 
    ticketsLoading, 
    fetchTicketReplies,
    addReply,
    updateTicketStatus,
    isAddingReply,
  } = useSupportTickets();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Use useQuery for replies - always called, but only fetches when ticket is selected
  const { data: replies, isLoading: repliesLoading, refetch: refetchReplies } = useQuery({
    queryKey: ["ticketReplies", selectedTicket?.id],
    queryFn: () => fetchTicketReplies(selectedTicket!.id),
    enabled: !!selectedTicket?.id,
  });

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    addReply({ ticketId: selectedTicket.id, message: replyMessage });
    setReplyMessage("");
    // Refetch replies after adding
    setTimeout(() => refetchReplies(), 500);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      open: "destructive",
      in_progress: "default",
      resolved: "secondary",
      closed: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      low: "outline",
      normal: "secondary",
      high: "default",
      urgent: "destructive",
    };
    return <Badge variant={variants[priority] || "outline"}>{priority}</Badge>;
  };

  return (
    <AdminLayout
      title="Support Tickets"
      description="Manage customer support requests"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>All Tickets</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace("_", " ")}
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{ticket.user_name}</p>
                        <p className="text-muted-foreground">{ticket.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{ticket.category}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {format(new Date(ticket.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
              {/* Ticket Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">From:</span>{" "}
                  {selectedTicket.user_name} ({selectedTicket.user_email})
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={selectedTicket.status}
                    onValueChange={(value) => {
                      updateTicketStatus({ ticketId: selectedTicket.id, status: value });
                      setSelectedTicket({ ...selectedTicket, status: value });
                    }}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedTicket.priority}
                    onValueChange={(value) => {
                      updateTicketStatus({ ticketId: selectedTicket.id, priority: value });
                      setSelectedTicket({ ...selectedTicket, priority: value });
                    }}
                  >
                    <SelectTrigger className="h-8 w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority} value={priority} className="capitalize">
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(selectedTicket.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              {/* Replies */}
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
                          {reply.is_admin_reply ? "Admin" : "User"}
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

              {/* Reply Input */}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
