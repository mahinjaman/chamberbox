import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface Visit {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  symptoms: string | null;
  diagnosis: string | null;
  advice: string | null;
  medicines: any;
  fees: number | null;
  payment_status: string | null;
  next_visit_date: string | null;
  created_at: string;
}

export interface VisitInsert {
  patient_id: string;
  symptoms?: string;
  diagnosis?: string;
  advice?: string;
  medicines?: any;
  fees?: number;
  payment_status?: string;
  next_visit_date?: string;
}

export const useVisits = (patientId?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ["visits", profile?.id, patientId],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      let query = supabase
        .from("visits")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("visit_date", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Visit[];
    },
    enabled: !!profile?.id,
  });

  const createVisit = useMutation({
    mutationFn: async (visit: VisitInsert) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("visits")
        .insert({
          ...visit,
          doctor_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      toast.success("Visit recorded");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateVisit = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VisitInsert> }) => {
      const { error } = await supabase
        .from("visits")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      toast.success("Visit updated");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  return {
    visits,
    isLoading,
    createVisit: createVisit.mutate,
    updateVisit: updateVisit.mutate,
    isCreating: createVisit.isPending,
  };
};
