import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface PrescriptionMedicine {
  name: string;
  name_bn?: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  visit_id: string | null;
  doctor_id: string;
  patient_id: string;
  medicines: PrescriptionMedicine[];
  advice: string | null;
  next_visit_date: string | null;
  language: string;
  template_name: string | null;
  qr_code: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    name: string;
    phone: string;
    age: number | null;
    gender: string | null;
  };
}

export interface PrescriptionInsert {
  patient_id: string;
  visit_id?: string;
  medicines: PrescriptionMedicine[];
  advice?: string;
  next_visit_date?: string;
  language?: string;
  template_name?: string;
}

export interface PrescriptionTemplate {
  id: string;
  doctor_id: string;
  name: string;
  medicines: PrescriptionMedicine[];
  advice: string | null;
  created_at: string;
}

export const usePrescriptions = (patientId?: string) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions", profile?.id, patientId],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          patient:patients(name, phone, age, gender)
        `)
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        ...p,
        medicines: (p.medicines as unknown as PrescriptionMedicine[]) || []
      })) as Prescription[];
    },
    enabled: !!profile?.id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["prescription-templates", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("prescription_templates")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("name");

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        medicines: (t.medicines as unknown as PrescriptionMedicine[]) || []
      })) as PrescriptionTemplate[];
    },
    enabled: !!profile?.id,
  });

  const createPrescription = useMutation({
    mutationFn: async (prescription: PrescriptionInsert) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("prescriptions")
        .insert([{
          patient_id: prescription.patient_id,
          visit_id: prescription.visit_id,
          medicines: prescription.medicines as unknown as any,
          advice: prescription.advice,
          next_visit_date: prescription.next_visit_date,
          language: prescription.language,
          template_name: prescription.template_name,
          doctor_id: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success("Prescription created successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: { name: string; medicines: PrescriptionMedicine[]; advice?: string }) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("prescription_templates")
        .insert([{
          doctor_id: profile.id,
          name: template.name,
          medicines: template.medicines as unknown as any,
          advice: template.advice,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-templates"] });
      toast.success("Template saved successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prescription_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-templates"] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  return {
    prescriptions,
    templates,
    isLoading,
    createPrescription: createPrescription.mutate,
    saveTemplate: saveTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isCreating: createPrescription.isPending,
  };
};
