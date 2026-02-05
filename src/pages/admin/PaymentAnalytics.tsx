 import { AdminLayout } from "@/components/admin/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Loader2, TrendingUp, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
 import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
 
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
 
   if (isLoading) {
     return (
       <AdminLayout
         title="Payment Analytics"
         description="Detailed payment reports and statistics"
       >
         <div className="flex items-center justify-center py-12">
           <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
         </div>
       </AdminLayout>
     );
   }
 
   return (
     <AdminLayout
       title="Payment Analytics"
       description="Detailed payment reports and statistics"
     >
       {/* Summary Cards */}
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
 
       {/* Breakdown Section */}
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