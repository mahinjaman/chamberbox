import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface Chamber {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  location_lat: number | null;
  location_lng: number | null;
  contact_number: string | null;
  new_patient_fee: number;
  return_patient_fee: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  chamber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  specialization: string | null;
  bmdc_number: string | null;
  chamber_address: string | null;
  slug: string | null;
  bio: string | null;
  services: string[];
  degrees: string[];
  languages: string[];
  experience_years: number;
  verified: boolean;
  is_public: boolean;
  seo_title: string | null;
  seo_description: string | null;
  patient_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export const useDoctorProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["doctor-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data as DoctorProfile;
    },
    enabled: !!user,
  });

  const { data: chambers, isLoading: chambersLoading } = useQuery({
    queryKey: ["chambers", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("chambers")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return data as Chamber[];
    },
    enabled: !!profile?.id,
  });

  const { data: availabilitySlots, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability-slots", chambers?.map(c => c.id)],
    queryFn: async () => {
      if (!chambers || chambers.length === 0) return [];
      const chamberIds = chambers.map(c => c.id);
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .in("chamber_id", chamberIds)
        .order("day_of_week");
      
      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!chambers && chambers.length > 0,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<DoctorProfile>) => {
      if (!profile) throw new Error("No profile found");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const upsertChamber = useMutation({
    mutationFn: async (chamber: Partial<Chamber> & { doctor_id: string; name: string; address: string }) => {
      if (chamber.id) {
        const { error } = await supabase
          .from("chambers")
          .update(chamber)
          .eq("id", chamber.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("chambers")
          .insert([chamber]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
      toast.success("Chamber saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save chamber: " + error.message);
    },
  });

  const deleteChamber = useMutation({
    mutationFn: async (chamberId: string) => {
      const { error } = await supabase
        .from("chambers")
        .delete()
        .eq("id", chamberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
      toast.success("Chamber deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete chamber: " + error.message);
    },
  });

  const upsertAvailability = useMutation({
    mutationFn: async (slots: Array<{
      chamber_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes?: number;
      is_active?: boolean;
    }>) => {
      // Delete existing slots for the chamber
      if (slots.length > 0 && slots[0].chamber_id) {
        await supabase
          .from("availability_slots")
          .delete()
          .eq("chamber_id", slots[0].chamber_id);
      }
      
      // Insert new slots
      if (slots.length > 0) {
        const { error } = await supabase
          .from("availability_slots")
          .insert(slots);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-slots"] });
      toast.success("Availability updated");
    },
    onError: (error) => {
      toast.error("Failed to update availability: " + error.message);
    },
  });

  return {
    profile,
    chambers,
    availabilitySlots,
    isLoading: profileLoading || chambersLoading || slotsLoading,
    updateProfile,
    upsertChamber,
    deleteChamber,
    upsertAvailability,
  };
};

// Hook for public profile fetching (by slug)
export const usePublicDoctorProfile = (slug: string) => {
  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();
      
      if (error) throw error;
      return data as DoctorProfile;
    },
    enabled: !!slug,
  });

  const { data: chambers } = useQuery({
    queryKey: ["public-chambers", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("chambers")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return data as Chamber[];
    },
    enabled: !!profile?.id,
  });

  const { data: availabilitySlots } = useQuery({
    queryKey: ["public-availability", chambers?.map(c => c.id)],
    queryFn: async () => {
      if (!chambers || chambers.length === 0) return [];
      const chamberIds = chambers.map(c => c.id);
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .in("chamber_id", chamberIds)
        .eq("is_active", true)
        .order("day_of_week");
      
      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!chambers && chambers.length > 0,
  });

  return {
    profile,
    chambers,
    availabilitySlots,
    isLoading: profileLoading,
    notFound: !!error,
  };
};
