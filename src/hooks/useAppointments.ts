import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Appointment {
  id: string;
  chamber_id: string;
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number | null;
  patient_gender: string | null;
  symptoms: string | null;
  is_follow_up: boolean;
  appointment_date: string;
  appointment_time: string;
  token_number: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  fee: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  chamber_id: string;
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age?: number;
  patient_gender?: string;
  symptoms?: string;
  is_follow_up: boolean;
  appointment_date: string;
  appointment_time: string;
  fee: number;
  payment_method: string;
}

export const useAppointments = (doctorId?: string, date?: string) => {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", doctorId, date],
    queryFn: async () => {
      if (!doctorId) return [];
      
      let query = supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("appointment_date", { ascending: true })
        .order("token_number", { ascending: true });
      
      if (date) {
        query = query.eq("appointment_date", date);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!doctorId,
  });

  const createAppointment = useMutation({
    mutationFn: async (booking: BookingFormData) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...booking,
          token_number: 0, // Will be set by trigger
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      return data;
    },
    onError: (error) => {
      toast.error("Failed to book appointment: " + error.message);
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      const { error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
    onError: (error) => {
      toast.error("Failed to update appointment: " + error.message);
    },
  });

  // Get booked slots for a specific date
  const getBookedSlots = async (doctorId: string, date: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .neq("status", "cancelled");
    
    if (error) return [];
    return data.map(a => a.appointment_time);
  };

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    getBookedSlots,
  };
};
