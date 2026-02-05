 import { AdminLayout } from "@/components/admin/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, CreditCard, AlertCircle, CheckCircle2, Users, Stethoscope, MessageSquare, FileText } from "lucide-react";
 import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Progress } from "@/components/ui/progress";
 
 interface SubscriptionPayment {
   id: string;
   doctor_id: string;
   plan_tier: string;
   billing_period: string;
   amount: number;
   payment_method: string;
   transaction_id: string;
   payer_mobile: string;
   status: string;
   created_at: string;
 }
 
 export default function PaymentAnalytics() {
   const { data: payments = [], isLoading } = useQuery({
     queryKey: ["admin-payment-analytics"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("subscription_payments" as any)
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
      return (data as any[]) as SubscriptionPayment[];
     },
   });
 
  // Fetch doctors data
  const { data: doctors = [] } = useQuery({
    queryKey: ["admin-analytics-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, subscription_tier, subscription_expires_at, created_at, is_approved");
      if (error) throw error;
      return data;
    },
  });

  // Fetch patients count
  const { data: patientsCount = 0 } = useQuery({
    queryKey: ["admin-analytics-patients"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch prescriptions count
  const { data: prescriptionsCount = 0 } = useQuery({
    queryKey: ["admin-analytics-prescriptions"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("prescriptions")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch support tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-analytics-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, status, created_at");
      if (error) throw error;
      return data;
    },
  });

   const now = new Date();
   const thisMonthStart = startOfMonth(now);
   const thisMonthEnd = endOfMonth(now);
   const lastMonthStart = startOfMonth(subMonths(now, 1));
   const lastMonthEnd = endOfMonth(subMonths(now, 1));
 
   // This month stats
   const thisMonthPayments = payments.filter(p => {
     const date = new Date(p.created_at);
     return date >= thisMonthStart && date <= thisMonthEnd;
   });
   
   const lastMonthPayments = payments.filter(p => {
     const date = new Date(p.created_at);
     return date >= lastMonthStart && date <= lastMonthEnd;
   });
 
   // Verified payments
   const thisMonthVerified = thisMonthPayments.filter(p => p.status === "verified");
   const lastMonthVerified = lastMonthPayments.filter(p => p.status === "verified");
   
   // Total amounts
   const thisMonthTotal = thisMonthVerified.reduce((sum, p) => sum + p.amount, 0);
   const lastMonthTotal = lastMonthVerified.reduce((sum, p) => sum + p.amount, 0);
   
   // Pending payments
   const pendingPayments = payments.filter(p => p.status === "pending");
   const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
 
   // All time verified total
   const allTimeVerified = payments.filter(p => p.status === "verified");
   const allTimeTotal = allTimeVerified.reduce((sum, p) => sum + p.amount, 0);
 
   // By payment method
   const byMethod = thisMonthVerified.reduce((acc, p) => {
     acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
     return acc;
   }, {} as Record<string, number>);
 
   // By plan
   const byPlan = thisMonthVerified.reduce((acc, p) => {
     acc[p.plan_tier] = (acc[p.plan_tier] || 0) + 1;
     return acc;
   }, {} as Record<string, number>);
 
   // Growth percentage
   const growth = lastMonthTotal > 0 
     ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
     : thisMonthTotal > 0 ? "100" : "0";
 
  // Doctor stats
  const totalDoctors = doctors.length;
  const newDoctorsThisMonth = doctors.filter(d => {
    const date = new Date(d.created_at);
    return date >= thisMonthStart && date <= thisMonthEnd;
  }).length;
  const approvedDoctors = doctors.filter(d => d.is_approved).length;
  const pendingApproval = doctors.filter(d => !d.is_approved).length;

  // Subscription distribution
  const subscriptionDist = doctors.reduce((acc, d) => {
    const tier = d.subscription_tier || 'trial';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Active subscriptions (not expired)
  const activeSubscriptions = doctors.filter(d => {
    if (!d.subscription_expires_at) return false;
    return new Date(d.subscription_expires_at) > now;
  }).length;

  // Support ticket stats
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;

   if (isLoading) {
     return (
       <AdminLayout
        title="Admin Analytics"
        description="Platform statistics and insights"
       >
         <div className="flex items-center justify-center py-12">
           <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
         </div>
       </AdminLayout>
     );
   }
 
   return (
     <AdminLayout
      title="Admin Analytics"
      description="Platform statistics and insights"
     >
      {/* Platform Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Stethoscope className="w-4 h-4" />
            <span className="text-sm font-medium">Total Doctors</span>
          </div>
          <p className="text-2xl font-bold">{totalDoctors}</p>
          <p className="text-xs text-muted-foreground mt-1">
            +{newDoctorsThisMonth} this month
          </p>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Total Patients</span>
          </div>
          <p className="text-2xl font-bold">{patientsCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Across all doctors
          </p>
        </div>
        
        <div className="bg-accent/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-accent-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Prescriptions</span>
          </div>
          <p className="text-2xl font-bold">{prescriptionsCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total created
          </p>
        </div>
        
        <div className="bg-success/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Active Subscriptions</span>
          </div>
          <p className="text-2xl font-bold">{activeSubscriptions}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {pendingApproval} pending approval
          </p>
        </div>
      </div>

      {/* Section Title: Revenue */}
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Revenue Overview
      </h3>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-primary/10 rounded-lg p-4">
           <div className="flex items-center gap-2 text-primary mb-2">
             <TrendingUp className="w-4 h-4" />
             <span className="text-sm font-medium">This Month</span>
           </div>
           <p className="text-2xl font-bold">৳{thisMonthTotal.toLocaleString()}</p>
           <p className="text-xs text-muted-foreground mt-1">
             {thisMonthVerified.length} verified payments
           </p>
         </div>
         
         <div className="bg-muted rounded-lg p-4">
           <div className="flex items-center gap-2 text-muted-foreground mb-2">
             <CreditCard className="w-4 h-4" />
             <span className="text-sm font-medium">Last Month</span>
           </div>
           <p className="text-2xl font-bold">৳{lastMonthTotal.toLocaleString()}</p>
           <p className="text-xs text-muted-foreground mt-1">
             {Number(growth) >= 0 ? "+" : ""}{growth}% vs this month
           </p>
         </div>
         
         <div className="bg-warning/10 rounded-lg p-4">
           <div className="flex items-center gap-2 text-warning mb-2">
             <AlertCircle className="w-4 h-4" />
             <span className="text-sm font-medium">Pending</span>
           </div>
           <p className="text-2xl font-bold">৳{pendingTotal.toLocaleString()}</p>
           <p className="text-xs text-muted-foreground mt-1">
             {pendingPayments.length} awaiting verification
           </p>
         </div>
         
         <div className="bg-success/10 rounded-lg p-4">
           <div className="flex items-center gap-2 text-success mb-2">
             <CheckCircle2 className="w-4 h-4" />
             <span className="text-sm font-medium">All Time</span>
           </div>
           <p className="text-2xl font-bold">৳{allTimeTotal.toLocaleString()}</p>
           <p className="text-xs text-muted-foreground mt-1">
             {allTimeVerified.length} total verified
           </p>
         </div>
       </div>
 
      {/* Subscription & Support Stats */}
       <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['trial', 'basic', 'pro', 'premium', 'enterprise'].map(tier => {
              const count = subscriptionDist[tier] || 0;
              const percentage = totalDoctors > 0 ? (count / totalDoctors) * 100 : 0;
              return (
                <div key={tier} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{tier}</span>
                    <span className="text-muted-foreground">{count} doctors ({percentage.toFixed(0)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Support Ticket Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">{openTickets}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTickets}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">{resolvedTickets}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{closedTickets}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Total: {tickets.length} tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown Section */}
      <h3 className="text-lg font-semibold mb-4">This Month's Payment Breakdown</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
         {/* By Payment Method */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base">This Month by Payment Method</CardTitle>
           </CardHeader>
           <CardContent>
             {Object.keys(byMethod).length > 0 ? (
               <div className="space-y-3">
                 {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                   <div key={method} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className={`w-3 h-3 rounded-full ${
                         method === "bkash" ? "bg-pink-500" :
                         method === "nagad" ? "bg-orange-500" :
                         method === "rocket" ? "bg-purple-500" :
                         method === "bank" ? "bg-blue-500" : "bg-gray-500"
                       }`} />
                       <span className="capitalize">{method}</span>
                     </div>
                     <span className="font-medium">৳{amount.toLocaleString()}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">No verified payments this month</p>
             )}
           </CardContent>
         </Card>
 
         {/* By Plan */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base">This Month by Plan</CardTitle>
           </CardHeader>
           <CardContent>
             {Object.keys(byPlan).length > 0 ? (
               <div className="space-y-3">
                 {Object.entries(byPlan).sort((a, b) => b[1] - a[1]).map(([plan, count]) => (
                   <div key={plan} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Badge variant="outline" className="capitalize">{plan}</Badge>
                     </div>
                     <span className="font-medium">{count} subscription{count !== 1 ? "s" : ""}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">No verified payments this month</p>
             )}
           </CardContent>
         </Card>
       </div>
 
       {/* Monthly Comparison */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base">Monthly Comparison</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr className="border-b">
                   <th className="text-left py-2 font-medium">Period</th>
                   <th className="text-right py-2 font-medium">Payments</th>
                   <th className="text-right py-2 font-medium">Verified</th>
                   <th className="text-right py-2 font-medium">Rejected</th>
                   <th className="text-right py-2 font-medium">Amount (Verified)</th>
                 </tr>
               </thead>
               <tbody>
                 <tr className="border-b">
                   <td className="py-3 font-medium">{format(thisMonthStart, "MMMM yyyy")}</td>
                   <td className="text-right">{thisMonthPayments.length}</td>
                   <td className="text-right text-success">{thisMonthVerified.length}</td>
                   <td className="text-right text-destructive">{thisMonthPayments.filter(p => p.status === "rejected").length}</td>
                   <td className="text-right font-medium">৳{thisMonthTotal.toLocaleString()}</td>
                 </tr>
                 <tr>
                   <td className="py-3 font-medium">{format(lastMonthStart, "MMMM yyyy")}</td>
                   <td className="text-right">{lastMonthPayments.length}</td>
                   <td className="text-right text-success">{lastMonthVerified.length}</td>
                   <td className="text-right text-destructive">{lastMonthPayments.filter(p => p.status === "rejected").length}</td>
                   <td className="text-right font-medium">৳{lastMonthTotal.toLocaleString()}</td>
                 </tr>
               </tbody>
             </table>
           </div>
         </CardContent>
       </Card>
     </AdminLayout>
   );
 }