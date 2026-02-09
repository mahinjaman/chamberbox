 import { AdminLayout } from "@/components/admin/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, CreditCard, AlertCircle, CheckCircle2, Users, Stethoscope, MessageSquare, FileText, Clock, Wallet } from "lucide-react";
 import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
 
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
        .select("id, subscription_tier, subscription_expires_at, created_at, is_approved, approval_status");
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
 
  // Doctor stats - only count approved doctors
  const approvedDoctors = doctors.filter(d => d.approval_status === "approved");
  const totalActiveDoctors = approvedDoctors.length;
  const newDoctorsThisMonth = doctors.filter(d => {
    const date = new Date(d.created_at);
    return date >= thisMonthStart && date <= thisMonthEnd;
  }).length;
  const pendingApproval = doctors.filter(d => !d.approval_status || d.approval_status === "pending").length;

  // Subscription distribution - only approved doctors
  const subscriptionDist = approvedDoctors.reduce((acc, d) => {
    const tier = d.subscription_tier || 'trial';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Active subscriptions - approved doctors with non-expired subscriptions
  const activeSubscriptions = approvedDoctors.filter(d => {
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
      {/* Platform Overview - Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
           <CardContent className="p-5">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Active Doctors</p>
                 <p className="text-3xl font-bold mt-1">{totalActiveDoctors}</p>
                 <p className="text-xs text-primary mt-1">
                   +{newDoctorsThisMonth} new this month
                 </p>
               </div>
               <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Stethoscope className="w-6 h-6 text-primary" />
               </div>
             </div>
           </CardContent>
         </Card>
        
        <Card className="border-muted bg-gradient-to-br from-muted/30 to-muted/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{patientsCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all doctors
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                <p className="text-3xl font-bold mt-1">{prescriptionsCount.toLocaleString()}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Total created
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-1">{activeSubscriptions}</p>
                <p className="text-xs text-warning mt-1">
                  {pendingApproval} pending approval
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Revenue Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <p className="text-2xl font-bold">৳{thisMonthTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {thisMonthVerified.length} verified payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Last Month</span>
              </div>
              <p className="text-2xl font-bold">৳{lastMonthTotal.toLocaleString()}</p>
              <p className={cn(
                "text-xs mt-1",
                Number(growth) >= 0 ? "text-success" : "text-destructive"
              )}>
                {Number(growth) >= 0 ? "+" : ""}{growth}% growth
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-warning mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold">৳{pendingTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingPayments.length} awaiting verification
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">All Time</span>
              </div>
              <p className="text-2xl font-bold">৳{allTimeTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {allTimeVerified.length} total verified
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription & Support Stats */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['trial', 'basic', 'pro', 'premium', 'enterprise'].map(tier => {
              const count = subscriptionDist[tier] || 0;
              const percentage = totalActiveDoctors > 0 ? (count / totalActiveDoctors) * 100 : 0;
              const colors: Record<string, string> = {
                trial: 'bg-muted-foreground',
                basic: 'bg-primary',
                pro: 'bg-blue-500',
                premium: 'bg-purple-500',
                enterprise: 'bg-amber-500'
              };
              return (
                <div key={tier} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{tier}</span>
                    <span className="text-muted-foreground">{count} doctors ({percentage.toFixed(0)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" indicatorClassName={colors[tier]} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Support Ticket Stats */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-warning/10 rounded-xl border border-warning/20">
                <p className="text-3xl font-bold text-warning">{openTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">Open</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                <p className="text-3xl font-bold text-success">{resolvedTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">Resolved</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl border">
                <p className="text-3xl font-bold">{closedTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">Closed</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Total: {tickets.length} tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          This Month's Payment Breakdown
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* By Payment Method */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">By Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(byMethod).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-3 h-3 rounded-full",
                          method === "bkash" ? "bg-pink-500" :
                          method === "nagad" ? "bg-orange-500" :
                          method === "rocket" ? "bg-purple-500" :
                          method === "bank" ? "bg-blue-500" : "bg-gray-500"
                        )} />
                        <span className="capitalize font-medium">{method}</span>
                      </div>
                      <span className="font-semibold">৳{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No verified payments this month</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Plan */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">By Plan Tier</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(byPlan).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(byPlan).sort((a, b) => b[1] - a[1]).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                        plan === "basic" ? "bg-primary/10 text-primary" :
                        plan === "pro" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                        plan === "premium" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                        plan === "enterprise" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {plan}
                      </span>
                      <span className="font-semibold">{count} subscription{count !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No verified payments this month</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Period</th>
                  <th className="text-right py-3 font-medium">Payments</th>
                  <th className="text-right py-3 font-medium">Verified</th>
                  <th className="text-right py-3 font-medium">Rejected</th>
                  <th className="text-right py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 font-medium">{format(thisMonthStart, "MMMM yyyy")}</td>
                  <td className="text-right">{thisMonthPayments.length}</td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3 h-3" />
                      {thisMonthVerified.length}
                    </span>
                  </td>
                  <td className="text-right text-destructive">{thisMonthPayments.filter(p => p.status === "rejected").length}</td>
                  <td className="text-right font-semibold">৳{thisMonthTotal.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="py-4 font-medium text-muted-foreground">{format(lastMonthStart, "MMMM yyyy")}</td>
                  <td className="text-right">{lastMonthPayments.length}</td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3 h-3" />
                      {lastMonthVerified.length}
                    </span>
                  </td>
                  <td className="text-right text-destructive">{lastMonthPayments.filter(p => p.status === "rejected").length}</td>
                  <td className="text-right font-semibold">৳{lastMonthTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
     </AdminLayout>
   );
 }