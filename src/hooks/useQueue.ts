import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface QueueToken {
  id: string;
  doctor_id: string;
  patient_id: string;
  token_number: number;
  queue_date: string;
  status: "waiting" | "current" | "completed" | "cancelled";
  estimated_time: string | null;
  called_at: string | null;
  completed_at: string | null;
  created_at: string;
  patient?: {
    name: string;
    phone: string;
  };
}

export const useQueue = (date?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const queueDate = date || new Date().toISOString().split("T")[0];

  const { data: queue = [], isLoading, error } = useQuery({
    queryKey: ["queue", profile?.id, queueDate],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("queue_tokens")
        .select(`
          *,
          patient:patients(name, phone)
        `)
        .eq("doctor_id", profile.id)
        .eq("queue_date", queueDate)
        .order("token_number", { ascending: true });

      if (error) throw error;
      return data as QueueToken[];
    },
    enabled: !!profile?.id,
  });

  const addToQueue = useMutation({
    mutationFn: async (patientId: string) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      // Get next token number
      const maxToken = queue.reduce((max, t) => Math.max(max, t.token_number), 0);
      
      const { data, error } = await supabase
        .from("queue_tokens")
        .insert({
          doctor_id: profile.id,
          patient_id: patientId,
          token_number: maxToken + 1,
          queue_date: queueDate,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id, queueDate] });
      toast.success("Patient added to queue");
    },
    onError: (error) => {
      toast.error("Failed to add to queue: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id, queueDate] });
    },
    onError: (error) => {
      toast.error("Failed to update queue: " + error.message);
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
    addToQueue: addToQueue.mutate,
    updateTokenStatus: updateTokenStatus.mutate,
    callNext,
    currentToken,
    waitingCount,
    completedCount,
    isAdding: addToQueue.isPending,
  };
};
