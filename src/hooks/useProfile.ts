import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  bmdc_number: string | null;
  chamber_address: string | null;
  subscription_tier: "basic" | "pro" | "premium";
  subscription_expires_at: string | null;
  avatar_url: string | null;
  degrees: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Chamber {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  contact_number: string | null;
  is_primary: boolean;
  new_patient_fee: number | null;
  return_patient_fee: number | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  // Fetch chambers for the doctor
  const { data: chambers, isLoading: chambersLoading } = useQuery({
    queryKey: ["chambers", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
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

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  return {
    profile,
    isLoading,
    error,
    chambers,
    chambersLoading,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};
