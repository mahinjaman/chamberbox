import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getPermissionsForRole, StaffPermissions } from "@/lib/staff-permissions";
export type StaffRole = "receptionist" | "assistant" | "manager";

export interface StaffMember {
  id: string;
  doctor_id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  chamber_access?: StaffChamberAccess[];
}

export interface StaffChamberAccess {
  id: string;
  staff_id: string;
  chamber_id: string;
  can_manage_queue: boolean;
  can_view_prescriptions: boolean;
  can_manage_patients: boolean;
  created_at: string;
  chamber?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface CreateStaffData {
  email: string;
  full_name: string;
  phone?: string;
  role: StaffRole;
  chamber_ids: string[];
}

export const useStaff = () => {
  const { profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all staff for the doctor
  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ["staff", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("staff_members")
        .select(`
          *,
          chamber_access:staff_chamber_access(
            *,
            chamber:chambers(id, name, address)
          )
        `)
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StaffMember[];
    },
    enabled: !!profile?.id,
  });

  // Check if current user is a staff member and load their permissions
  const { data: staffInfo, isLoading: staffInfoLoading } = useQuery({
    queryKey: ["staffInfo", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("staff_members")
        .select(`
          *,
          chamber_access:staff_chamber_access(
            *,
            chamber:chambers(id, name, address)
          ),
          doctor:profiles!staff_members_doctor_id_fkey(
            id, full_name, specialization, avatar_url, slug
          ),
          custom_permissions:staff_custom_permissions(*)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Add new staff member
  const addStaff = useMutation({
    mutationFn: async (staffData: CreateStaffData) => {
      if (!profile?.id) throw new Error("No profile found");

      // First create the staff member
      const { data: newStaff, error: staffError } = await supabase
        .from("staff_members")
        .insert({
          doctor_id: profile.id,
          email: staffData.email,
          full_name: staffData.full_name,
          phone: staffData.phone || null,
          role: staffData.role,
        })
        .select()
        .single();

      if (staffError) throw staffError;

      // Then add chamber access
      if (staffData.chamber_ids.length > 0) {
        const chamberAccess = staffData.chamber_ids.map((chamberId) => ({
          staff_id: newStaff.id,
          chamber_id: chamberId,
          can_manage_queue: true,
          can_view_prescriptions: true,
          can_manage_patients: true,
        }));

        const { error: accessError } = await supabase
          .from("staff_chamber_access")
          .insert(chamberAccess);

        if (accessError) throw accessError;
      }

      return newStaff;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate key")) {
        toast.error("This email is already registered as staff");
      } else {
        toast.error("Failed to add staff: " + error.message);
      }
    },
  });

  // Update staff member
  const updateStaff = useMutation({
    mutationFn: async ({
      staffId,
      updates,
      chamberIds,
    }: {
      staffId: string;
      updates: Partial<StaffMember>;
      chamberIds?: string[];
    }) => {
      const { error: updateError } = await supabase
        .from("staff_members")
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          role: updates.role,
          is_active: updates.is_active,
        })
        .eq("id", staffId);

      if (updateError) throw updateError;

      // Update chamber access if provided
      if (chamberIds !== undefined) {
        // Delete existing access
        await supabase
          .from("staff_chamber_access")
          .delete()
          .eq("staff_id", staffId);

        // Add new access
        if (chamberIds.length > 0) {
          const chamberAccess = chamberIds.map((chamberId) => ({
            staff_id: staffId,
            chamber_id: chamberId,
            can_manage_queue: true,
            can_view_prescriptions: true,
            can_manage_patients: true,
          }));

          const { error: accessError } = await supabase
            .from("staff_chamber_access")
            .insert(chamberAccess);

          if (accessError) throw accessError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member updated");
    },
    onError: (error) => {
      toast.error("Failed to update staff: " + error.message);
    },
  });

  // Delete staff member
  const deleteStaff = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from("staff_members")
        .delete()
        .eq("id", staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member removed");
    },
    onError: (error) => {
      toast.error("Failed to remove staff: " + error.message);
    },
  });

  // Link staff account when they sign up
  const linkStaffAccount = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.email) throw new Error("No user found");

      const { error } = await supabase
        .from("staff_members")
        .update({
          user_id: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq("email", user.email)
        .is("user_id", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffInfo"] });
    },
  });

  // Send password reset email to staff
  const sendPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error) => {
      toast.error("Failed to send reset email: " + error.message);
    },
  });

  // Get permissions for current staff member (merge custom with role defaults)
  const staffPermissions: StaffPermissions | null = (() => {
    if (!staffInfo) return null;
    
    const roleDefaults = getPermissionsForRole(staffInfo.role as StaffRole);
    const customPerms = staffInfo.custom_permissions?.[0];
    
    // If no custom permissions or not using custom, return role defaults
    if (!customPerms || !customPerms.use_custom) {
      return roleDefaults;
    }
    
    // Merge custom permissions with role defaults
    return {
      canManageQueue: customPerms.can_manage_queue ?? roleDefaults.canManageQueue,
      canViewPatientList: customPerms.can_view_patient_list ?? roleDefaults.canViewPatientList,
      canAddPatients: customPerms.can_add_patients ?? roleDefaults.canAddPatients,
      canEditPatients: customPerms.can_edit_patients ?? roleDefaults.canEditPatients,
      canViewPrescriptions: customPerms.can_view_prescriptions ?? roleDefaults.canViewPrescriptions,
      canViewFinances: customPerms.can_view_finances ?? roleDefaults.canViewFinances,
      canManageStaff: customPerms.can_manage_staff ?? roleDefaults.canManageStaff,
      canManageIntegrations: customPerms.can_manage_integrations ?? roleDefaults.canManageIntegrations,
      canViewSettings: customPerms.can_view_settings ?? roleDefaults.canViewSettings,
      canManageChambers: customPerms.can_manage_chambers ?? roleDefaults.canManageChambers,
    };
  })();

  return {
    staffMembers,
    staffLoading,
    staffInfo,
    staffInfoLoading,
    staffPermissions,
    isStaff: !!staffInfo,
    addStaff: addStaff.mutate,
    updateStaff: updateStaff.mutate,
    deleteStaff: deleteStaff.mutate,
    linkStaffAccount: linkStaffAccount.mutate,
    sendPasswordReset: sendPasswordReset.mutate,
    isAddingStaff: addStaff.isPending,
    isUpdatingStaff: updateStaff.isPending,
    isDeletingStaff: deleteStaff.isPending,
    isSendingPasswordReset: sendPasswordReset.isPending,
  };
};
