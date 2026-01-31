import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface Patient {
  id: string;
  doctor_id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  blood_group: string | null;
  address: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  created_at: string;
  updated_at: string;
}

export type PatientInsert = Omit<Patient, "id" | "created_at" | "updated_at">;
export type PatientUpdate = Partial<Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">>;

export const usePatients = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ["patients", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!profile?.id,
  });

  const addPatient = useMutation({
    mutationFn: async (patient: Omit<PatientInsert, "doctor_id">) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("patients")
        .insert({ ...patient, doctor_id: profile.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", profile?.id] });
      toast.success("Patient added successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updatePatient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PatientUpdate }) => {
      const { error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", profile?.id] });
      toast.success("Patient updated successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", profile?.id] });
      toast.success("Patient deleted successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const searchPatients = (query: string) => {
    if (!query) return patients;
    const lowerQuery = query.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.phone.includes(query)
    );
  };

  return {
    patients,
    isLoading,
    error,
    addPatient: addPatient.mutate,
    updatePatient: updatePatient.mutate,
    deletePatient: deletePatient.mutate,
    searchPatients,
    isAdding: addPatient.isPending,
    isUpdating: updatePatient.isPending,
    isDeleting: deletePatient.isPending,
  };
};
