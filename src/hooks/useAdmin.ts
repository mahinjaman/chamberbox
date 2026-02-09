import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "super_admin";
  created_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  bmdc_number: string | null;
  doctor_code: string | null;
  subscription_tier: "trial" | "basic" | "pro" | "premium" | "enterprise" | null;
  subscription_expires_at: string | null;
  is_approved: boolean | null;
  approved_at: string | null;
  created_at: string;
  is_public: boolean | null;
  admin_notes: string | null;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc("is_admin", { _user_id: user.id });
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return data as boolean;
    },
    enabled: !!user?.id,
  });

  // Fetch all doctors for admin management
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["adminDoctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DoctorProfile[];
    },
    enabled: !!isAdmin,
  });

  // Approve doctor
  const approveDoctor = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", doctorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Doctor approved successfully");
    },
    onError: (error) => {
      toast.error("Failed to approve doctor: " + error.message);
    },
  });

  // Revoke doctor approval
  const revokeApproval = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          approved_at: null,
          approved_by: null,
        })
        .eq("id", doctorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Approval revoked");
    },
    onError: (error) => {
      toast.error("Failed to revoke approval: " + error.message);
    },
  });

  // Update subscription
  const updateSubscription = useMutation({
    mutationFn: async ({ 
      doctorId, 
      tier, 
      expiresAt 
    }: { 
      doctorId: string; 
      tier: DoctorProfile["subscription_tier"]; 
      expiresAt: string | null;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_expires_at: expiresAt,
        })
        .eq("id", doctorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Subscription updated");
    },
    onError: (error) => {
      toast.error("Failed to update subscription: " + error.message);
    },
  });

  // Bulk approve doctors
  const bulkApprove = useMutation({
    mutationFn: async (doctorIds: string[]) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .in("id", doctorIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Doctors approved");
    },
    onError: (error) => toast.error("Bulk approve failed: " + error.message),
  });

  // Bulk reject (revoke) doctors
  const bulkReject = useMutation({
    mutationFn: async (doctorIds: string[]) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          approved_at: null,
          approved_by: null,
        })
        .in("id", doctorIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Doctors rejected");
    },
    onError: (error) => toast.error("Bulk reject failed: " + error.message),
  });

  // Update admin notes
  const updateAdminNotes = useMutation({
    mutationFn: async ({ doctorId, notes }: { doctorId: string; notes: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ admin_notes: notes } as any)
        .eq("id", doctorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Note saved");
    },
    onError: (error) => toast.error("Failed to save note: " + error.message),
  });

  // Mark as spam (reject + add note)
  const bulkMarkSpam = useMutation({
    mutationFn: async (doctorIds: string[]) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          approved_at: null,
          approved_by: null,
          admin_notes: "Marked as spam",
        } as any)
        .in("id", doctorIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast.success("Marked as spam");
    },
    onError: (error) => toast.error("Failed: " + error.message),
  });

  return {
    isAdmin,
    isAdminLoading,
    doctors,
    doctorsLoading,
    approveDoctor: approveDoctor.mutate,
    revokeApproval: revokeApproval.mutate,
    updateSubscription: updateSubscription.mutate,
    bulkApprove: bulkApprove.mutate,
    bulkReject: bulkReject.mutate,
    bulkMarkSpam: bulkMarkSpam.mutate,
    updateAdminNotes: updateAdminNotes.mutate,
    isApproving: approveDoctor.isPending,
    isRevoking: revokeApproval.isPending,
    isUpdatingSubscription: updateSubscription.isPending,
    isBulkProcessing: bulkApprove.isPending || bulkReject.isPending || bulkMarkSpam.isPending,
  };
};
