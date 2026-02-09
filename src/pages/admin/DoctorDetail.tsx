import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { supabase } from "@/integrations/supabase/client";
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Users,
    FileText,
    Building2,
    Clock,
    Loader2,
    ExternalLink,
    KeyRound,
    MailCheck,
  } from "lucide-react";
  import { format, differenceInDays } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];
 
 interface DoctorFullProfile {
   id: string;
   user_id: string;
   full_name: string;
   email: string | null;
   phone: string | null;
   specialization: string | null;
   bmdc_number: string | null;
   bio: string | null;
   degrees: string[] | null;
   experience_years: number | null;
   avatar_url: string | null;
   is_public: boolean | null;
   slug: string | null;
   subscription_tier: string | null;
   subscription_expires_at: string | null;
  is_approved: boolean | null;
  approved_at: string | null;
  created_at: string;
  doctor_code: string | null;
  approval_status: string | null;
}
 
 interface SubscriptionUsage {
   total_patients: number | null;
   patients_added_this_month: number | null;
   total_prescriptions: number | null;
   prescriptions_this_month: number | null;
   sms_sent_this_month: number | null;
   total_sms_sent: number | null;
 }
 
 interface SubscriptionPayment {
   id: string;
   amount: number;
   payment_method: string;
   transaction_id: string;
   plan_tier: string;
   billing_period: string;
   status: string;
   created_at: string;
   verified_at: string | null;
 }
 
 interface SubscriptionPlan {
   tier: string;
   max_patients: number | null;
   max_prescriptions_per_month: number | null;
   max_chambers: number | null;
   max_staff: number | null;
   sms_credits: number | null;
 }
 
 interface ChamberInfo {
   id: string;
   name: string;
   address: string;
   is_active: boolean;
 }
 
 interface StaffInfo {
   id: string;
   full_name: string;
   email: string;
   role: string;
   is_active: boolean;
 }
 
  export default function DoctorDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [sendingReset, setSendingReset] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [changingEmail, setChangingEmail] = useState(false);

    // Check if caller is super_admin
    const { data: isSuperAdmin } = useQuery({
      queryKey: ["isSuperAdmin", user?.id],
      queryFn: async () => {
        if (!user?.id) return false;
        const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "super_admin" });
        if (error) return false;
        return data as boolean;
      },
      enabled: !!user?.id,
    });
 
   // Fetch doctor profile
   const { data: doctor, isLoading: doctorLoading } = useQuery({
     queryKey: ["adminDoctorDetail", id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("profiles")
         .select("*")
         .eq("id", id)
         .single();
 
       if (error) throw error;
       return data as DoctorFullProfile;
     },
     enabled: !!id,
   });
 
   // Fetch subscription usage
   const { data: usage } = useQuery({
     queryKey: ["adminDoctorUsage", id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("subscription_usage")
         .select("*")
         .eq("doctor_id", id)
         .single();
 
       if (error && error.code !== "PGRST116") throw error;
       return data as SubscriptionUsage | null;
     },
     enabled: !!id,
   });
 
   // Fetch subscription plan limits
   const { data: plan } = useQuery({
     queryKey: ["subscriptionPlan", doctor?.subscription_tier],
     queryFn: async () => {
      const tierValue = (doctor?.subscription_tier || "trial") as SubscriptionTier;
       const { data, error } = await supabase
         .from("subscription_plans")
         .select("tier, max_patients, max_prescriptions_per_month, max_chambers, max_staff, sms_credits")
        .eq("tier", tierValue)
        .maybeSingle();
 
      if (error) throw error;
       return data as SubscriptionPlan | null;
     },
    enabled: !!doctor,
   });
 
   // Fetch payment history
   const { data: payments } = useQuery({
     queryKey: ["adminDoctorPayments", id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("subscription_payments")
         .select("*")
         .eq("doctor_id", id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as SubscriptionPayment[];
     },
     enabled: !!id,
   });
 
   // Fetch chambers
   const { data: chambers } = useQuery({
     queryKey: ["adminDoctorChambers", id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("chambers")
         .select("id, name, address, is_active")
         .eq("doctor_id", id);
 
       if (error) throw error;
       return data as ChamberInfo[];
     },
     enabled: !!id,
   });
 
   // Fetch staff
   const { data: staff } = useQuery({
     queryKey: ["adminDoctorStaff", id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("staff_members")
         .select("id, full_name, email, role, is_active")
         .eq("doctor_id", id);
 
       if (error) throw error;
       return data as StaffInfo[];
     },
     enabled: !!id,
   });
 
    if (doctorLoading) {
      return (
        <AdminLayout title="Doctor Details" description="Loading...">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </AdminLayout>
      );
    }

    const handleSendPasswordReset = async () => {
      if (!doctor) return;
      setSendingReset(true);
      try {
        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: { action: "send_password_reset", doctor_id: doctor.id },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast.success(data.message || "Password reset link sent!");
      } catch (err: any) {
        toast.error(err.message || "Failed to send password reset");
      } finally {
        setSendingReset(false);
      }
    };

    const handleChangeEmail = async () => {
      if (!doctor || !newEmail.trim()) return;
      setChangingEmail(true);
      try {
        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: { action: "change_email", doctor_id: doctor.id, new_email: newEmail.trim() },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast.success(data.message || "Email changed!");
        setEmailDialogOpen(false);
        setNewEmail("");
        queryClient.invalidateQueries({ queryKey: ["adminDoctorDetail", id] });
      } catch (err: any) {
        toast.error(err.message || "Failed to change email");
      } finally {
        setChangingEmail(false);
      }
    };
 
   if (!doctor) {
     return (
       <AdminLayout title="Doctor Details" description="Doctor not found">
         <Card>
           <CardContent className="py-10 text-center">
             <p className="text-muted-foreground">Doctor not found</p>
             <Button asChild className="mt-4">
               <Link to="/admin/doctors">Back to Doctors</Link>
             </Button>
           </CardContent>
         </Card>
       </AdminLayout>
     );
   }
 
   const getSubscriptionStatus = () => {
     if (!doctor.subscription_expires_at) {
       return { status: "Active", isExpired: false, daysLeft: null };
     }
     const expiryDate = new Date(doctor.subscription_expires_at);
     const now = new Date();
     const daysLeft = differenceInDays(expiryDate, now);
     
     if (daysLeft < 0) {
       return { status: "Expired", isExpired: true, daysLeft: Math.abs(daysLeft) };
     }
     return { status: "Active", isExpired: false, daysLeft };
   };
 
   const { status: subStatus, isExpired, daysLeft } = getSubscriptionStatus();
 
   const getUsagePercent = (used: number | null, limit: number | null) => {
     if (limit === null || limit === -1) return 0; // Unlimited
     if (!used) return 0;
     return Math.min((used / limit) * 100, 100);
   };
 
   const formatLimit = (limit: number | null) => {
     if (limit === null || limit === -1) return "Unlimited";
     return limit.toString();
   };
 
   return (
     <AdminLayout
       title="Doctor Details"
       description={`Viewing ${doctor.full_name}'s profile`}
     >
       <div className="space-y-6">
         {/* Back Button */}
         <Button variant="ghost" asChild className="mb-4">
           <Link to="/admin/doctors">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Doctors
           </Link>
         </Button>
 
         {/* Profile Header */}
         <Card>
           <CardContent className="pt-6">
             <div className="flex flex-col md:flex-row gap-6">
               <Avatar className="w-24 h-24">
                 <AvatarImage src={doctor.avatar_url || ""} />
                 <AvatarFallback className="text-2xl">
                   {doctor.full_name?.charAt(0) || "D"}
                 </AvatarFallback>
               </Avatar>
               
               <div className="flex-1 space-y-3">
                 <div className="flex flex-wrap items-center gap-3">
                   <h2 className="text-2xl font-bold">{doctor.full_name}</h2>
                    {doctor.approval_status === "approved" ? (
                      <Badge className="bg-emerald-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    ) : doctor.approval_status === "spam" ? (
                      <Badge variant="destructive">Spam</Badge>
                    ) : doctor.approval_status === "rejected" ? (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                   <Badge variant="outline" className="capitalize">
                     {doctor.subscription_tier || "trial"}
                   </Badge>
                 </div>
                 
                 {doctor.specialization && (
                   <p className="text-muted-foreground">{doctor.specialization}</p>
                 )}
                 
                 <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                   {doctor.email && (
                     <div className="flex items-center gap-1">
                       <Mail className="w-4 h-4" />
                       {doctor.email}
                     </div>
                   )}
                   {doctor.phone && (
                     <div className="flex items-center gap-1">
                       <Phone className="w-4 h-4" />
                       {doctor.phone}
                     </div>
                   )}
                   {doctor.bmdc_number && (
                     <div className="flex items-center gap-1">
                       <FileText className="w-4 h-4" />
                       BMDC: {doctor.bmdc_number}
                     </div>
                   )}
                   {doctor.doctor_code && (
                     <div className="flex items-center gap-1">
                       <User className="w-4 h-4" />
                       Code: {doctor.doctor_code}
                     </div>
                   )}
                 </div>
 
                 <div className="flex flex-wrap gap-4 text-sm">
                   <div className="flex items-center gap-1 text-muted-foreground">
                     <Calendar className="w-4 h-4" />
                     Joined: {format(new Date(doctor.created_at), "MMM d, yyyy")}
                   </div>
                   {doctor.is_public && doctor.slug && (
                     <a 
                       href={`/doctor/${doctor.slug}`} 
                       target="_blank" 
                       className="flex items-center gap-1 text-primary hover:underline"
                     >
                       <ExternalLink className="w-4 h-4" />
                       Public Profile
                     </a>
                   )}
                  </div>

                  {/* Admin Actions */}
                  {doctor.approval_status === "approved" && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendPasswordReset}
                        disabled={sendingReset}
                      >
                        {sendingReset ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4 mr-2" />
                        )}
                        Send Password Reset
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewEmail(doctor.email || "");
                            setEmailDialogOpen(true);
                          }}
                        >
                          <MailCheck className="w-4 h-4 mr-2" />
                          Change Email
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
 
         {/* Subscription Info */}
         <div className="grid gap-6 md:grid-cols-2">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <CreditCard className="w-5 h-5" />
                 Subscription
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Plan</span>
                 <Badge variant="outline" className="capitalize text-base">
                   {doctor.subscription_tier || "trial"}
                 </Badge>
               </div>
               <Separator />
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Status</span>
                 <Badge variant={isExpired ? "destructive" : "default"}>
                   {subStatus}
                 </Badge>
               </div>
               {doctor.subscription_expires_at && (
                 <>
                   <Separator />
                   <div className="flex justify-between items-center">
                     <span className="text-muted-foreground">Expires</span>
                     <span className={isExpired ? "text-destructive" : ""}>
                       {format(new Date(doctor.subscription_expires_at), "MMM d, yyyy")}
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-muted-foreground">Days Left</span>
                     <span className={`font-medium ${isExpired ? "text-destructive" : daysLeft && daysLeft <= 7 ? "text-warning" : "text-success"}`}>
                       {isExpired ? `Expired ${daysLeft} days ago` : `${daysLeft} days`}
                     </span>
                   </div>
                 </>
               )}
               <Separator />
               <Button asChild variant="outline" className="w-full">
                 <Link to={`/admin/subscriptions?search=${encodeURIComponent(doctor.email || doctor.full_name)}`}>
                   Manage Subscription
                 </Link>
               </Button>
             </CardContent>
           </Card>
 
           {/* Usage Stats */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Clock className="w-5 h-5" />
                 Usage This Month
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Patients</span>
                   <span>{usage?.patients_added_this_month || 0} / {formatLimit(plan?.max_patients ?? null)}</span>
                 </div>
                 <Progress value={getUsagePercent(usage?.patients_added_this_month ?? null, plan?.max_patients ?? null)} />
               </div>
 
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Prescriptions</span>
                   <span>{usage?.prescriptions_this_month || 0} / {formatLimit(plan?.max_prescriptions_per_month ?? null)}</span>
                 </div>
                 <Progress value={getUsagePercent(usage?.prescriptions_this_month ?? null, plan?.max_prescriptions_per_month ?? null)} />
               </div>
 
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">SMS Credits</span>
                   <span>{usage?.sms_sent_this_month || 0} / {formatLimit(plan?.sms_credits ?? null)}</span>
                 </div>
                 <Progress value={getUsagePercent(usage?.sms_sent_this_month ?? null, plan?.sms_credits ?? null)} />
               </div>
 
               <Separator />
 
               <div className="grid grid-cols-2 gap-4 text-center">
                 <div>
                   <p className="text-2xl font-bold">{usage?.total_patients || 0}</p>
                   <p className="text-xs text-muted-foreground">Total Patients</p>
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{usage?.total_prescriptions || 0}</p>
                   <p className="text-xs text-muted-foreground">Total Prescriptions</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Chambers & Staff */}
         <div className="grid gap-6 md:grid-cols-2">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Building2 className="w-5 h-5" />
                 Chambers ({chambers?.length || 0} / {formatLimit(plan?.max_chambers ?? null)})
               </CardTitle>
             </CardHeader>
             <CardContent>
               {chambers && chambers.length > 0 ? (
                 <div className="space-y-3">
                   {chambers.map((chamber) => (
                     <div key={chamber.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                       <div>
                         <p className="font-medium">{chamber.name}</p>
                         <p className="text-sm text-muted-foreground">{chamber.address}</p>
                       </div>
                       <Badge variant={chamber.is_active ? "default" : "secondary"}>
                         {chamber.is_active ? "Active" : "Inactive"}
                       </Badge>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-muted-foreground text-center py-4">No chambers added</p>
               )}
             </CardContent>
           </Card>
 
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Users className="w-5 h-5" />
                 Staff Members ({staff?.length || 0} / {formatLimit(plan?.max_staff ?? null)})
               </CardTitle>
             </CardHeader>
             <CardContent>
               {staff && staff.length > 0 ? (
                 <div className="space-y-3">
                   {staff.map((member) => (
                     <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                       <div>
                         <p className="font-medium">{member.full_name}</p>
                         <p className="text-sm text-muted-foreground">{member.email}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className="capitalize">{member.role}</Badge>
                         {member.is_active ? (
                           <CheckCircle className="w-4 h-4 text-success" />
                         ) : (
                           <XCircle className="w-4 h-4 text-muted-foreground" />
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-muted-foreground text-center py-4">No staff members</p>
               )}
             </CardContent>
           </Card>
         </div>
 
         {/* Payment History */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <CreditCard className="w-5 h-5" />
               Payment History
             </CardTitle>
             <CardDescription>
               All subscription payments made by this doctor
             </CardDescription>
           </CardHeader>
           <CardContent>
             {payments && payments.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Date</TableHead>
                     <TableHead>Plan</TableHead>
                     <TableHead>Period</TableHead>
                     <TableHead>Method</TableHead>
                     <TableHead>Transaction ID</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {payments.map((payment) => (
                     <TableRow key={payment.id}>
                       <TableCell>
                         {format(new Date(payment.created_at), "MMM d, yyyy")}
                       </TableCell>
                       <TableCell className="capitalize">{payment.plan_tier}</TableCell>
                       <TableCell className="capitalize">{payment.billing_period}</TableCell>
                       <TableCell className="capitalize">{payment.payment_method}</TableCell>
                       <TableCell className="font-mono text-sm">{payment.transaction_id}</TableCell>
                       <TableCell>৳{payment.amount}</TableCell>
                       <TableCell>
                         <Badge 
                           variant={
                             payment.status === "verified" ? "default" : 
                             payment.status === "rejected" ? "destructive" : 
                             "secondary"
                           }
                         >
                           {payment.status}
                         </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-muted-foreground text-center py-8">No payment history</p>
             )}
           </CardContent>
         </Card>
        </div>

        {/* Change Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Doctor Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-medium text-foreground">{doctor?.email}</span>
              </p>
              <Input
                placeholder="New email address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will update the authentication email and profile email. The change takes effect immediately.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleChangeEmail} disabled={changingEmail || !newEmail.trim()}>
                {changingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Change Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }