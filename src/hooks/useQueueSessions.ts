import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface QueueSession {
  id: string;
  doctor_id: string;
  chamber_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: "open" | "running" | "paused" | "closed";
  current_token: number;
  max_patients: number;
  avg_consultation_minutes: number;
  is_custom: boolean;
  notes: string | null;
  booking_open: boolean;
  created_at: string;
  updated_at: string;
  chamber?: {
    name: string;
    address: string;
  };
  tokens_count?: number;
}

export interface CreateSessionInput {
  chamber_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  max_patients?: number;
  avg_consultation_minutes?: number;
  is_custom?: boolean;
  notes?: string;
}

export const useQueueSessions = (date?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const sessionDate = date || new Date().toISOString().split("T")[0];

  // Get all sessions for a date - auto-create from schedule if needed
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["queue_sessions", profile?.id, sessionDate],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      // First, check if sessions exist for this date
      const { data: existingSessions, error: fetchError } = await supabase
        .from("queue_sessions")
        .select(`
          *,
          chamber:chambers(name, address)
        `)
        .eq("doctor_id", profile.id)
        .eq("session_date", sessionDate)
        .order("start_time", { ascending: true });

      if (fetchError) throw fetchError;
      
      // Get the day of week for this date
      const dateObj = new Date(sessionDate + "T00:00:00");
      const dayOfWeek = dateObj.getDay();
      
      // Get all chambers and their availability slots for this day
      const { data: chambers } = await supabase
        .from("chambers")
        .select(`
          id, name, address,
          availability_slots!inner(
            day_of_week, start_time, end_time, slot_duration_minutes, is_active
          )
        `)
        .eq("doctor_id", profile.id);
      
      // Filter slots for this day of week
      const scheduledSlots: Array<{
        chamber_id: string;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number;
      }> = [];
      
      chambers?.forEach(chamber => {
        const slots = (chamber.availability_slots as Array<{
          day_of_week: number;
          start_time: string;
          end_time: string;
          slot_duration_minutes: number | null;
          is_active: boolean | null;
        }>)?.filter(slot => 
          slot.day_of_week === dayOfWeek && slot.is_active !== false
        ) || [];
        
        slots.forEach(slot => {
          scheduledSlots.push({
            chamber_id: chamber.id,
            start_time: slot.start_time.slice(0, 5),
            end_time: slot.end_time.slice(0, 5),
            slot_duration_minutes: slot.slot_duration_minutes || 5,
          });
        });
      });
      
      // Check which scheduled slots don't have sessions yet
      const existingKeys = new Set(
        existingSessions?.map(s => `${s.chamber_id}-${s.start_time.slice(0, 5)}`) || []
      );
      
      const missingSessions = scheduledSlots.filter(
        slot => !existingKeys.has(`${slot.chamber_id}-${slot.start_time}`)
      );
      
      // Auto-create missing sessions
      if (missingSessions.length > 0) {
        const newSessions = missingSessions.map(slot => ({
          doctor_id: profile.id,
          chamber_id: slot.chamber_id,
          session_date: sessionDate,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: "open",
          current_token: 0,
          max_patients: 30,
          avg_consultation_minutes: slot.slot_duration_minutes,
          is_custom: false,
          booking_open: true,
        }));
        
        await supabase.from("queue_sessions").insert(newSessions);
        
        // Re-fetch to get the newly created sessions with chamber data
        const { data: updatedSessions, error: refetchError } = await supabase
          .from("queue_sessions")
          .select(`
            *,
            chamber:chambers(name, address)
          `)
          .eq("doctor_id", profile.id)
          .eq("session_date", sessionDate)
          .order("start_time", { ascending: true });
        
        if (refetchError) throw refetchError;
        existingSessions?.splice(0, existingSessions.length, ...(updatedSessions || []));
      }
      
      const finalSessions = existingSessions || [];
      
      // Get token counts for each session
      const sessionIds = finalSessions.map(s => s.id);
      if (sessionIds.length > 0) {
        const { data: tokenCounts } = await supabase
          .from("queue_tokens")
          .select("session_id")
          .in("session_id", sessionIds);
        
        const countMap: Record<string, number> = {};
        tokenCounts?.forEach(t => {
          if (t.session_id) {
            countMap[t.session_id] = (countMap[t.session_id] || 0) + 1;
          }
        });
        
        return finalSessions.map(s => ({
          ...s,
          tokens_count: countMap[s.id] || 0
        })) as QueueSession[];
      }
      
      return finalSessions as QueueSession[];
    },
    enabled: !!profile?.id,
  });

  // Create a new session
  const createSession = useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("queue_sessions")
        .insert({
          doctor_id: profile.id,
          ...input,
          status: "open",
          current_token: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_sessions", profile?.id, sessionDate] });
      toast.success("Session created");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QueueSession["status"] }) => {
      const { error } = await supabase
        .from("queue_sessions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_sessions", profile?.id, sessionDate] });
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Update current token number
  const updateCurrentToken = useMutation({
    mutationFn: async ({ id, current_token }: { id: string; current_token: number }) => {
      const { error } = await supabase
        .from("queue_sessions")
        .update({ current_token, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_sessions", profile?.id, sessionDate] });
    },
  });

  // Toggle booking open/close
  const toggleBookingOpen = useMutation({
    mutationFn: async ({ id, booking_open }: { id: string; booking_open: boolean }) => {
      const { error } = await supabase
        .from("queue_sessions")
        .update({ booking_open, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["queue_sessions", profile?.id, sessionDate] });
      toast.success(variables.booking_open ? "Booking enabled" : "Booking closed");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      // First delete all tokens in this session
      await supabase
        .from("queue_tokens")
        .delete()
        .eq("session_id", id);
      
      const { error } = await supabase
        .from("queue_sessions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_sessions", profile?.id, sessionDate] });
      toast.success("Session deleted");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const activeSession = sessions.find(s => s.status === "running");
  const openSessions = sessions.filter(s => s.status === "open" || s.status === "running");

  return {
    sessions,
    isLoading,
    error,
    activeSession,
    openSessions,
    createSession: createSession.mutate,
    createSessionAsync: createSession.mutateAsync,
    updateSessionStatus: updateSessionStatus.mutate,
    updateCurrentToken: updateCurrentToken.mutate,
    toggleBookingOpen: toggleBookingOpen.mutate,
    deleteSession: deleteSession.mutate,
    isCreating: createSession.isPending,
  };
};

// Define interface for public session
export interface PublicQueueSession {
  id: string;
  chamber_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  current_token: number;
  max_patients: number;
  avg_consultation_minutes: number;
  booking_open: boolean;
  chamber?: {
    name: string;
    address: string;
  };
  tokens_count?: number;
}

// Hook for public session access (for patients)
export const usePublicQueueSessions = (doctorId: string, date?: string) => {
  const sessionDate = date || new Date().toISOString().split("T")[0];

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["public_queue_sessions", doctorId, sessionDate],
    queryFn: async (): Promise<PublicQueueSession[]> => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("queue_sessions")
        .select(`
          id,
          chamber_id,
          session_date,
          start_time,
          end_time,
          status,
          current_token,
          max_patients,
          avg_consultation_minutes,
          booking_open,
          chamber:chambers(name, address)
        `)
        .eq("doctor_id", doctorId)
        .eq("session_date", sessionDate)
        .in("status", ["open", "running"])
        .order("start_time", { ascending: true });

      if (error) throw error;
      
      // Get token counts
      const sessionIds = data?.map(s => s.id) || [];
      if (sessionIds.length > 0) {
        const { data: tokenCounts } = await supabase
          .from("queue_tokens")
          .select("session_id")
          .in("session_id", sessionIds)
          .neq("status", "cancelled");
        
        const countMap: Record<string, number> = {};
        tokenCounts?.forEach(t => {
          if (t.session_id) {
            countMap[t.session_id] = (countMap[t.session_id] || 0) + 1;
          }
        });
        
        return data?.map(s => ({
          ...s,
          tokens_count: countMap[s.id] || 0
        })) as PublicQueueSession[];
      }
      
      return data as PublicQueueSession[];
    },
    enabled: !!doctorId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return { sessions, isLoading };
};
