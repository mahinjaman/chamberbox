 import { useState } from "react";
 import { AdminLayout } from "@/components/admin/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/lib/auth";
 import { toast } from "sonner";
 import { Plus, UserPlus, Shield, Users, Trash2, Mail, Phone, Edit } from "lucide-react";
 import { format } from "date-fns";
 
 interface AdminRole {
   id: string;
   user_id: string;
   role: "admin" | "super_admin";
   created_at: string;
   user_email?: string;
 }
 
 interface AdminStaff {
   id: string;
   user_id: string | null;
   email: string;
   full_name: string;
   phone: string | null;
   role: string;
   is_active: boolean;
   invited_at: string;
   accepted_at: string | null;
 }
 
 export default function AdminManagement() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
   const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
   const [deleteType, setDeleteType] = useState<"admin" | "staff">("admin");
   
   const [adminEmail, setAdminEmail] = useState("");
   const [adminRole, setAdminRole] = useState<"admin" | "super_admin">("admin");
   
   const [staffForm, setStaffForm] = useState({
     email: "",
     full_name: "",
     phone: "",
     role: "support",
   });
 
   // Fetch admin roles with user emails
   const { data: admins, isLoading: adminsLoading } = useQuery({
     queryKey: ["admin-roles"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("user_roles")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as AdminRole[];
     },
   });
 
   // Fetch admin staff
   const { data: adminStaff, isLoading: staffLoading } = useQuery({
     queryKey: ["admin-staff"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("admin_staff")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as AdminStaff[];
     },
   });
 
   // Add new admin
   const addAdmin = useMutation({
     mutationFn: async ({ email, role }: { email: string; role: "admin" | "super_admin" }) => {
       // First, find the user by email in profiles
       const { data: profile, error: profileError } = await supabase
         .from("profiles")
         .select("user_id, email")
         .eq("email", email)
         .single();
 
       if (profileError || !profile) {
         throw new Error("User not found. They must sign up first.");
       }
 
       // Add admin role
       const { error } = await supabase
         .from("user_roles")
         .insert({
           user_id: profile.user_id,
           role: role,
         });
 
       if (error) {
         if (error.message.includes("duplicate")) {
           throw new Error("This user already has an admin role.");
         }
         throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
       toast.success("Admin added successfully");
       setShowAddAdminDialog(false);
       setAdminEmail("");
       setAdminRole("admin");
     },
     onError: (error: Error) => {
       toast.error(error.message);
     },
   });
 
   // Remove admin
   const removeAdmin = useMutation({
     mutationFn: async (roleId: string) => {
       const { error } = await supabase
         .from("user_roles")
         .delete()
         .eq("id", roleId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
       toast.success("Admin removed");
       setShowDeleteDialog(null);
     },
     onError: (error: Error) => {
       toast.error("Failed to remove admin: " + error.message);
     },
   });
 
   // Add admin staff
   const addStaff = useMutation({
     mutationFn: async (data: typeof staffForm) => {
       const { error } = await supabase
         .from("admin_staff")
         .insert({
           email: data.email,
           full_name: data.full_name,
           phone: data.phone || null,
           role: data.role,
           invited_by: user?.id,
         });
 
       if (error) {
         if (error.message.includes("duplicate")) {
           throw new Error("This email is already registered as admin staff.");
         }
         throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
       toast.success("Staff member added successfully");
       setShowAddStaffDialog(false);
       setStaffForm({ email: "", full_name: "", phone: "", role: "support" });
     },
     onError: (error: Error) => {
       toast.error(error.message);
     },
   });
 
   // Toggle staff status
   const toggleStaffStatus = useMutation({
     mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
       const { error } = await supabase
         .from("admin_staff")
         .update({ is_active })
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
       toast.success("Staff status updated");
     },
     onError: (error: Error) => {
       toast.error("Failed to update status: " + error.message);
     },
   });
 
   // Delete admin staff
   const deleteStaff = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from("admin_staff")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
       toast.success("Staff member removed");
       setShowDeleteDialog(null);
     },
     onError: (error: Error) => {
       toast.error("Failed to remove staff: " + error.message);
     },
   });
 
   const handleDelete = () => {
     if (!showDeleteDialog) return;
     if (deleteType === "admin") {
       removeAdmin.mutate(showDeleteDialog);
     } else {
       deleteStaff.mutate(showDeleteDialog);
     }
   };
 
   const getRoleBadge = (role: string) => {
     switch (role) {
       case "super_admin":
         return <Badge className="bg-destructive">Super Admin</Badge>;
       case "admin":
         return <Badge className="bg-primary">Admin</Badge>;
       case "manager":
         return <Badge className="bg-blue-500">Manager</Badge>;
       case "support":
         return <Badge variant="secondary">Support</Badge>;
       default:
         return <Badge variant="outline">{role}</Badge>;
     }
   };
 
   return (
     <AdminLayout
       title="Admin Management"
       description="Manage admins and admin panel staff"
     >
       <Tabs defaultValue="admins" className="space-y-4">
         <TabsList>
           <TabsTrigger value="admins" className="gap-2">
             <Shield className="w-4 h-4" />
             Admins
           </TabsTrigger>
           <TabsTrigger value="staff" className="gap-2">
             <Users className="w-4 h-4" />
             Admin Staff
           </TabsTrigger>
         </TabsList>
 
         {/* Admins Tab */}
         <TabsContent value="admins">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle>Admin Users</CardTitle>
                 <p className="text-sm text-muted-foreground mt-1">
                   Users with administrative access to the platform
                 </p>
               </div>
               <Button onClick={() => setShowAddAdminDialog(true)} size="sm">
                 <UserPlus className="w-4 h-4 mr-2" />
                 Add Admin
               </Button>
             </CardHeader>
             <CardContent>
               {adminsLoading ? (
                 <p className="text-muted-foreground">Loading...</p>
               ) : admins && admins.length > 0 ? (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>User ID</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Added</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {admins.map((admin) => (
                       <TableRow key={admin.id}>
                         <TableCell className="font-mono text-sm">
                           {admin.user_id.substring(0, 8)}...
                         </TableCell>
                         <TableCell>{getRoleBadge(admin.role)}</TableCell>
                         <TableCell>
                           {format(new Date(admin.created_at), "MMM d, yyyy")}
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-destructive hover:text-destructive"
                             onClick={() => {
                               setDeleteType("admin");
                               setShowDeleteDialog(admin.id);
                             }}
                             disabled={admin.user_id === user?.id}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               ) : (
                 <p className="text-muted-foreground">No admins found</p>
               )}
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Admin Staff Tab */}
         <TabsContent value="staff">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle>Admin Panel Staff</CardTitle>
                 <p className="text-sm text-muted-foreground mt-1">
                   Support staff who can help manage the admin panel
                 </p>
               </div>
               <Button onClick={() => setShowAddStaffDialog(true)} size="sm">
                 <Plus className="w-4 h-4 mr-2" />
                 Add Staff
               </Button>
             </CardHeader>
             <CardContent>
               {staffLoading ? (
                 <p className="text-muted-foreground">Loading...</p>
               ) : adminStaff && adminStaff.length > 0 ? (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Name</TableHead>
                       <TableHead>Contact</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Joined</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {adminStaff.map((staff) => (
                       <TableRow key={staff.id}>
                         <TableCell className="font-medium">{staff.full_name}</TableCell>
                         <TableCell>
                           <div className="space-y-1">
                             <div className="flex items-center gap-1 text-sm">
                               <Mail className="w-3 h-3 text-muted-foreground" />
                               {staff.email}
                             </div>
                             {staff.phone && (
                               <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                 <Phone className="w-3 h-3" />
                                 {staff.phone}
                               </div>
                             )}
                           </div>
                         </TableCell>
                         <TableCell>{getRoleBadge(staff.role)}</TableCell>
                         <TableCell>
                           {staff.accepted_at ? (
                             <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                               Active
                             </Badge>
                           ) : staff.is_active ? (
                             <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                               Pending
                             </Badge>
                           ) : (
                             <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                               Inactive
                             </Badge>
                           )}
                         </TableCell>
                         <TableCell>
                           {staff.accepted_at
                             ? format(new Date(staff.accepted_at), "MMM d, yyyy")
                             : format(new Date(staff.invited_at), "MMM d, yyyy")}
                         </TableCell>
                         <TableCell className="text-right">
                           <div className="flex justify-end gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => 
                                 toggleStaffStatus.mutate({ 
                                   id: staff.id, 
                                   is_active: !staff.is_active 
                                 })
                               }
                             >
                               {staff.is_active ? "Deactivate" : "Activate"}
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="text-destructive hover:text-destructive"
                               onClick={() => {
                                 setDeleteType("staff");
                                 setShowDeleteDialog(staff.id);
                               }}
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               ) : (
                 <p className="text-muted-foreground">No admin staff found</p>
               )}
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
 
       {/* Add Admin Dialog */}
       <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Add New Admin</DialogTitle>
           </DialogHeader>
           <form
             onSubmit={(e) => {
               e.preventDefault();
               addAdmin.mutate({ email: adminEmail, role: adminRole });
             }}
             className="space-y-4"
           >
             <div className="space-y-2">
               <Label htmlFor="admin-email">User Email</Label>
               <Input
                 id="admin-email"
                 type="email"
                 placeholder="admin@example.com"
                 value={adminEmail}
                 onChange={(e) => setAdminEmail(e.target.value)}
                 required
               />
               <p className="text-xs text-muted-foreground">
                 The user must already have an account on the platform
               </p>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="admin-role">Admin Role</Label>
               <Select value={adminRole} onValueChange={(v) => setAdminRole(v as "admin" | "super_admin")}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="admin">Admin</SelectItem>
                   <SelectItem value="super_admin">Super Admin</SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={() => setShowAddAdminDialog(false)}>
                 Cancel
               </Button>
               <Button type="submit" disabled={addAdmin.isPending}>
                 {addAdmin.isPending ? "Adding..." : "Add Admin"}
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>
 
       {/* Add Staff Dialog */}
       <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Add Admin Staff</DialogTitle>
           </DialogHeader>
           <form
             onSubmit={(e) => {
               e.preventDefault();
               addStaff.mutate(staffForm);
             }}
             className="space-y-4"
           >
             <div className="space-y-2">
               <Label htmlFor="staff-name">Full Name</Label>
               <Input
                 id="staff-name"
                 placeholder="John Doe"
                 value={staffForm.full_name}
                 onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="staff-email">Email</Label>
               <Input
                 id="staff-email"
                 type="email"
                 placeholder="staff@example.com"
                 value={staffForm.email}
                 onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="staff-phone">Phone (Optional)</Label>
               <Input
                 id="staff-phone"
                 placeholder="01XXXXXXXXX"
                 value={staffForm.phone}
                 onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="staff-role">Role</Label>
               <Select 
                 value={staffForm.role} 
                 onValueChange={(v) => setStaffForm({ ...staffForm, role: v })}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="support">Support</SelectItem>
                   <SelectItem value="manager">Manager</SelectItem>
                   <SelectItem value="super">Super</SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={() => setShowAddStaffDialog(false)}>
                 Cancel
               </Button>
               <Button type="submit" disabled={addStaff.isPending}>
                 {addStaff.isPending ? "Adding..." : "Add Staff"}
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>
 
       {/* Delete Confirmation Dialog */}
       <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This will remove the {deleteType === "admin" ? "admin privileges" : "staff member"} permanently.
               This action cannot be undone.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               onClick={handleDelete}
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </AdminLayout>
   );
 }