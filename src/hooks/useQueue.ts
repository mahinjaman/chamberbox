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
  serial_number: string | null; // Unique booking reference (e.g., 260203-1234-0001)
  queue_date: string;
  status: "waiting" | "current" | "completed" | "cancelled";
  estimated_time: string | null;
  called_at: string | null;
  completed_at: string | null;
  booked_by: "internal" | "public";
  created_at: string;
  // New fields for workflow tracking
  prescription_id: string | null;
  payment_collected: boolean;
  payment_amount: number | null;
  payment_method: string | null;
  visiting_reason: string | null;
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
      
      // If we have a session, also get the session's chamber_id to match orphan tokens
      let sessionChamberId: string | null = null;
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from("queue_sessions")
          .select("chamber_id")
          .eq("id", sessionId)
          .single();
        sessionChamberId = sessionData?.chamber_id || null;
      }
      
      let query = supabase
        .from("queue_tokens")
        .select(`
          *,
          patient:patients(name, phone, age, gender, blood_group)
        `)
        .eq("doctor_id", profile.id)
        .eq("queue_date", queueDate)
        .order("token_number", { ascending: true });
      
      // Filter by session if provided - include both session tokens AND orphan tokens for same chamber
      if (sessionId && sessionChamberId) {
        // Get tokens that either belong to this session OR are orphans (null session_id) for same chamber
        query = query.or(`session_id.eq.${sessionId},and(session_id.is.null,chamber_id.eq.${sessionChamberId})`);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Auto-link orphan tokens to the session if they match chamber
      if (sessionId && sessionChamberId && data) {
        const orphanTokens = data.filter(t => t.session_id === null && t.chamber_id === sessionChamberId);
        if (orphanTokens.length > 0) {
          // Link orphan tokens to this session in background
          await supabase
            .from("queue_tokens")
            .update({ session_id: sessionId })
            .in("id", orphanTokens.map(t => t.id));
          
          // Update the returned data to reflect the link
          data.forEach(t => {
            if (orphanTokens.some(o => o.id === t.id)) {
              t.session_id = sessionId;
            }
          });
        }
      }
      
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
      
      // Get max token number for this doctor/date combination (across ALL sessions)
      const { data: existingTokens } = await supabase
        .from("queue_tokens")
        .select("token_number")
        .eq("doctor_id", profile.id)
        .eq("queue_date", queueDate);
      
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

  // Update prescription link on token
  const linkPrescription = useMutation({
    mutationFn: async ({ tokenId, prescriptionId }: { tokenId: string; prescriptionId: string }) => {
      const { error } = await supabase
        .from("queue_tokens")
        .update({ prescription_id: prescriptionId })
        .eq("id", tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id] });
      toast.success("Prescription linked");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Update payment status on token
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ 
      tokenId, 
      amount, 
      method 
    }: { 
      tokenId: string; 
      amount: number; 
      method: string;
    }) => {
      const { error } = await supabase
        .from("queue_tokens")
        .update({ 
          payment_collected: true,
          payment_amount: amount,
          payment_method: method,
        })
        .eq("id", tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", profile?.id] });
      toast.success("Payment recorded");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Complete current patient and call next
  const callNext = async (skipIncomplete = false) => {
    const currentPatient = queue.find((t) => t.status === "current");
    
    // Check if current patient has incomplete tasks
    if (currentPatient && !skipIncomplete) {
      const hasPrescription = !!currentPatient.prescription_id;
      const hasPayment = currentPatient.payment_collected;
      
      if (!hasPrescription || !hasPayment) {
        // Return info about incomplete tasks - caller should handle this
        return { 
          incomplete: true, 
          hasPrescription, 
          hasPayment,
          currentPatient 
        };
      }
    }
    
    // Complete current patient
    if (currentPatient) {
      await updateTokenStatus.mutateAsync({ id: currentPatient.id, status: "completed" });
    }

    // Call next waiting patient
    const nextPatient = queue.find((t) => t.status === "waiting");
    if (nextPatient) {
      await updateTokenStatus.mutateAsync({ id: nextPatient.id, status: "current" });
      toast.success(`Calling patient #${nextPatient.token_number}`);
    } else {
      toast.info("No more patients in queue");
    }
    
    return { incomplete: false };
  };

  // Force complete - skip prescription/payment checks
  const forceCompleteAndCallNext = async () => {
    return callNext(true);
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
    forceCompleteAndCallNext,
    linkPrescription: linkPrescription.mutate,
    updatePaymentStatus: updatePaymentStatus.mutate,
    currentToken,
    waitingCount,
    completedCount,
    isAdding: addToQueue.isPending,
  };
};
