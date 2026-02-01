import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface QueueToken {
  id: string;
  doctor_id: string;
  patient_id: string;
  session_id: string | null;
  chamber_id: string | null;
  token_number: number;
  queue_date: string;
  status: "waiting" | "current" | "completed" | "cancelled";
  estimated_time: string | null;
  called_at: string | null;
  completed_at: string | null;
  booked_by: "internal" | "public";
  created_at: string;
  patient?: {
    name: string;
    phone: string;
    age: number | null;
    gender: string | null;
    blood_group: string | null;
  };
}

export const useQueue = (sessionId?: string, date?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const queueDate = date || new Date().toISOString().split("T")[0];

  const { data: queue = [], isLoading, error } = useQuery({
    queryKey: ["queue", profile?.id, sessionId, queueDate],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      let query = supabase
        .from("queue_tokens")
        .select(`
          *,
          patient:patients(name, phone, age, gender, blood_group)
        `)
        .eq("doctor_id", profile.id)
        .eq("queue_date", queueDate)
        .order("token_number", { ascending: true });
      
      // Filter by session if provided
      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as QueueToken[];
    },
    enabled: !!profile?.id,
  });

  const addToQueue = useMutation({
    mutationFn: async ({ patientId, sessionId: sid, chamberId }: { 
      patientId: string; 
      sessionId?: string; 
      chamberId?: string;
    }) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      // Get max token number for this session/date combination
      let query = supabase
        .from("queue_tokens")
        .select("token_number")
        .eq("doctor_id", profile.id)
        .eq("queue_date", queueDate);
      
      if (sid) {
        query = query.eq("session_id", sid);
      }
      
      const { data: existingTokens } = await query;
      const maxToken = existingTokens?.reduce((max, t) => Math.max(max, t.token_number), 0) || 0;
      const tokenNumber = maxToken + 1;
      
      const { data, error } = await supabase
        .from("queue_tokens")
        .insert({
          doctor_id: profile.id,
          patient_id: patientId,
          session_id: sid || null,
          chamber_id: chamberId || null,
          token_number: tokenNumber,
          queue_date: queueDate,
          status: "waiting",
          booked_by: "internal",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id] });
      toast.success("Patient added to queue");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateTokenStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QueueToken["status"] }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "current") {
        updates.called_at = new Date().toISOString();
      } else if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("queue_tokens")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id] });
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const callNext = async () => {
    // First, complete the current patient
    const currentPatient = queue.find((t) => t.status === "current");
    if (currentPatient) {
      await updateTokenStatus.mutateAsync({ id: currentPatient.id, status: "completed" });
    }

    // Then call the next waiting patient
    const nextPatient = queue.find((t) => t.status === "waiting");
    if (nextPatient) {
      await updateTokenStatus.mutateAsync({ id: nextPatient.id, status: "current" });
      toast.success(`Calling patient #${nextPatient.token_number}`);
    } else {
      toast.info("No more patients in queue");
    }
  };

  const currentToken = queue.find((t) => t.status === "current");
  const waitingCount = queue.filter((t) => t.status === "waiting").length;
  const completedCount = queue.filter((t) => t.status === "completed").length;

  return {
    queue,
    isLoading,
    error,
    addToQueue: (patientId: string, sessionId?: string, chamberId?: string) => 
      addToQueue.mutate({ patientId, sessionId, chamberId }),
    updateTokenStatus: updateTokenStatus.mutate,
    callNext,
    currentToken,
    waitingCount,
    completedCount,
    isAdding: addToQueue.isPending,
  };
};
