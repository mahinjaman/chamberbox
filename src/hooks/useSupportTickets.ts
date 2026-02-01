import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useAdmin } from "./useAdmin";

export interface SupportTicket {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  // Fetch tickets - all for admin, own for users
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["supportTickets", isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user?.id,
  });

  // Fetch replies for a ticket
  const fetchTicketReplies = async (ticketId: string) => {
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as TicketReply[];
  };

  // Create ticket
  const createTicket = useMutation({
    mutationFn: async (ticket: {
      subject: string;
      message: string;
      category: string;
      priority?: string;
      user_name?: string;
      user_email?: string;
      user_phone?: string;
    }) => {
      const { data: profile } = user?.id ? await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("user_id", user.id)
        .single() : { data: null };

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user?.id || null,
          user_name: ticket.user_name || profile?.full_name || "Guest",
          user_email: ticket.user_email || profile?.email || "",
          user_phone: ticket.user_phone || profile?.phone,
          subject: ticket.subject,
          message: ticket.message,
          category: ticket.category,
          priority: ticket.priority || "normal",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      toast.success("Support ticket created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create ticket: " + error.message);
    },
  });

  // Add reply
  const addReply = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await supabase
        .from("support_ticket_replies")
        .insert({
          ticket_id: ticketId,
          user_id: user?.id,
          message,
          is_admin_reply: isAdmin || false,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticketReplies", variables.ticketId] });
      toast.success("Reply added");
    },
    onError: (error) => {
      toast.error("Failed to add reply: " + error.message);
    },
  });

  // Update ticket status (admin only)
  const updateTicketStatus = useMutation({
    mutationFn: async ({ 
      ticketId, 
      status,
      priority,
      assigned_to,
    }: { 
      ticketId: string; 
      status?: string;
      priority?: string;
      assigned_to?: string | null;
    }) => {
      const updates: Partial<SupportTicket> = {};
      if (status) updates.status = status;
      if (priority) updates.priority = priority;
      if (assigned_to !== undefined) updates.assigned_to = assigned_to;
      if (status === "resolved") updates.resolved_at = new Date().toISOString();

      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      toast.success("Ticket updated");
    },
    onError: (error) => {
      toast.error("Failed to update ticket: " + error.message);
    },
  });

  return {
    tickets,
    ticketsLoading,
    fetchTicketReplies,
    createTicket: createTicket.mutate,
    addReply: addReply.mutate,
    updateTicketStatus: updateTicketStatus.mutate,
    isCreating: createTicket.isPending,
    isAddingReply: addReply.isPending,
    isUpdating: updateTicketStatus.isPending,
  };
};
