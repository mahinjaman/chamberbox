 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/lib/auth";
 import { toast } from "sonner";
 
 export type AdminStaffRole = "support" | "manager" | "super";
 
 export interface AdminStaffMember {
   id: string;
   user_id: string | null;
   email: string;
   full_name: string;
   phone: string | null;
   role: AdminStaffRole;
   is_active: boolean;
   invited_at: string | null;
   invited_by: string | null;
   accepted_at: string | null;
   created_at: string;
 }
 
 export interface AdminStaffPermissions {
   canViewDashboard: boolean;
   canManageDoctors: boolean;
   canManageSubscriptions: boolean;
   canVerifyPayments: boolean;
   canConfigurePlans: boolean;
   canManageTickets: boolean;
   canManageTutorials: boolean;
   canManageAdmins: boolean;
 }
 
 /**
  * Returns permissions based on admin staff role
  * Support: Only tickets
  * Manager: Tickets + Doctors + View subscriptions
  * Super: Full access
  */
 export function getAdminStaffPermissions(role: AdminStaffRole): AdminStaffPermissions {
   switch (role) {
     case "support":
       return {
         canViewDashboard: true,
         canManageDoctors: false,
         canManageSubscriptions: false,
         canVerifyPayments: false,
         canConfigurePlans: false,
         canManageTickets: true,
         canManageTutorials: false,
         canManageAdmins: false,
       };
     case "manager":
       return {
         canViewDashboard: true,
         canManageDoctors: true,
         canManageSubscriptions: true,
         canVerifyPayments: true,
         canConfigurePlans: false,
         canManageTickets: true,
         canManageTutorials: true,
         canManageAdmins: false,
       };
     case "super":
       return {
         canViewDashboard: true,
         canManageDoctors: true,
         canManageSubscriptions: true,
         canVerifyPayments: true,
         canConfigurePlans: true,
         canManageTickets: true,
         canManageTutorials: true,
         canManageAdmins: true,
       };
     default:
       return {
         canViewDashboard: false,
         canManageDoctors: false,
         canManageSubscriptions: false,
         canVerifyPayments: false,
         canConfigurePlans: false,
         canManageTickets: false,
         canManageTutorials: false,
         canManageAdmins: false,
       };
   }
 }
 
 export const useAdminStaff = () => {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   // Check if user is a full admin (from user_roles table)
   const { data: isFullAdmin, isLoading: isFullAdminLoading } = useQuery({
     queryKey: ["isFullAdmin", user?.id],
     queryFn: async () => {
       if (!user?.id) return false;
       const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
       return data as boolean;
     },
     enabled: !!user?.id,
   });
 
   // Check if user is admin staff and get their info
   const { data: adminStaffInfo, isLoading: adminStaffLoading } = useQuery({
     queryKey: ["adminStaffInfo", user?.id],
     queryFn: async () => {
       if (!user?.id) return null;
 
       const { data, error } = await supabase
         .from("admin_staff")
         .select("*")
         .eq("user_id", user.id)
         .eq("is_active", true)
         .maybeSingle();
 
       if (error && error.code !== "PGRST116") throw error;
       return data as AdminStaffMember | null;
     },
     enabled: !!user?.id,
   });
 
   // Fetch all admin staff (for management page)
   const { data: allAdminStaff, isLoading: allAdminStaffLoading } = useQuery({
     queryKey: ["allAdminStaff"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("admin_staff")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as AdminStaffMember[];
     },
     enabled: isFullAdmin === true,
   });
 
   // Add new admin staff
   const addAdminStaff = useMutation({
     mutationFn: async (staffData: {
       email: string;
       full_name: string;
       phone?: string;
       role: AdminStaffRole;
     }) => {
       const { data, error } = await supabase
         .from("admin_staff")
         .insert({
           email: staffData.email,
           full_name: staffData.full_name,
           phone: staffData.phone || null,
           role: staffData.role,
           invited_by: user?.id,
           invited_at: new Date().toISOString(),
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["allAdminStaff"] });
       toast.success("Admin staff added successfully");
     },
     onError: (error: Error) => {
       if (error.message.includes("duplicate")) {
         toast.error("This email is already registered");
       } else {
         toast.error("Failed to add staff: " + error.message);
       }
     },
   });
 
   // Update admin staff
   const updateAdminStaff = useMutation({
     mutationFn: async ({
       staffId,
       updates,
     }: {
       staffId: string;
       updates: Partial<AdminStaffMember>;
     }) => {
       const { error } = await supabase
         .from("admin_staff")
         .update(updates)
         .eq("id", staffId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["allAdminStaff"] });
       toast.success("Staff updated");
     },
     onError: (error) => {
       toast.error("Failed to update: " + error.message);
     },
   });
 
   // Delete admin staff
   const deleteAdminStaff = useMutation({
     mutationFn: async (staffId: string) => {
       const { error } = await supabase
         .from("admin_staff")
         .delete()
         .eq("id", staffId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["allAdminStaff"] });
       toast.success("Staff removed");
     },
     onError: (error) => {
       toast.error("Failed to remove: " + error.message);
     },
   });
 
   // Link staff account on signup
   const linkAdminStaffAccount = useMutation({
     mutationFn: async () => {
       if (!user?.id || !user?.email) throw new Error("No user found");
 
       const { error } = await supabase
         .from("admin_staff")
         .update({
           user_id: user.id,
           accepted_at: new Date().toISOString(),
         })
         .eq("email", user.email)
         .is("user_id", null);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["adminStaffInfo"] });
     },
   });
 
   // Calculate permissions
   const permissions: AdminStaffPermissions | null = (() => {
     // Full admins (from user_roles) have all permissions
     if (isFullAdmin) {
       return {
         canViewDashboard: true,
         canManageDoctors: true,
         canManageSubscriptions: true,
         canVerifyPayments: true,
         canConfigurePlans: true,
         canManageTickets: true,
         canManageTutorials: true,
         canManageAdmins: true,
       };
     }
 
     // Admin staff get role-based permissions
     if (adminStaffInfo) {
       return getAdminStaffPermissions(adminStaffInfo.role as AdminStaffRole);
     }
 
     return null;
   })();
 
   const isLoading = isFullAdminLoading || adminStaffLoading;
   const hasAdminAccess = isFullAdmin || !!adminStaffInfo;
 
   return {
     // Auth state
     isFullAdmin,
     adminStaffInfo,
     hasAdminAccess,
     isLoading,
     permissions,
     
     // Staff management
     allAdminStaff,
     allAdminStaffLoading,
     addAdminStaff: addAdminStaff.mutate,
     updateAdminStaff: updateAdminStaff.mutate,
     deleteAdminStaff: deleteAdminStaff.mutate,
     linkAdminStaffAccount: linkAdminStaffAccount.mutate,
     
     // Loading states
     isAddingStaff: addAdminStaff.isPending,
     isUpdatingStaff: updateAdminStaff.isPending,
     isDeletingStaff: deleteAdminStaff.isPending,
   };
 };