import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Check, X, Eye, Clock } from "lucide-react";
import { format, addMonths, addYears } from "date-fns";

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
  notes: string | null;
  created_at: string;
  doctor?: {
    full_name: string;
    email: string;
  };
}

export default function PaymentVerification() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-subscription-payments"],
    queryFn: async () => {
      // First get payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("subscription_payments" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Then get doctor info for each payment
      const doctorIds = [...new Set((paymentsData as any[]).map((p: any) => p.doctor_id))];
      const { data: doctorsData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", doctorIds);

      const doctorMap = new Map((doctorsData || []).map(d => [d.id, d]));

      return (paymentsData as any[]).map((p: any) => ({
        ...p,
        doctor: doctorMap.get(p.doctor_id) || null,
      })) as SubscriptionPayment[];
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");

      // Update payment status
      const { error: paymentError } = await supabase
        .from("subscription_payments" as any)
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Calculate expiry date
      const expiresAt =
        payment.billing_period === "yearly"
          ? addYears(new Date(), 1)
          : addMonths(new Date(), 1);

      // Update doctor subscription
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: payment.plan_tier as any,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", payment.doctor_id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Payment verified and subscription updated!");
      setSelectedPayment(null);
    },
    onError: (error: any) => {
      toast.error("Failed to verify: " + error.message);
    },
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      const { error } = await supabase
        .from("subscription_payments" as any)
        .update({
          status: "rejected",
          notes: reason,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Payment rejected");
      setShowRejectDialog(false);
      setSelectedPayment(null);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast.error("Failed to reject: " + error.message);
    },
  });

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.doctor?.full_name?.toLowerCase().includes(searchLower) ||
      payment.doctor?.email?.toLowerCase().includes(searchLower) ||
      payment.transaction_id.toLowerCase().includes(searchLower) ||
      payment.payer_mobile.includes(searchQuery)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case "verified":
        return <Badge variant="default" className="gap-1"><Check className="w-3 h-3" /> Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><X className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      bkash: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      nagad: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      rocket: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return (
      <Badge variant="outline" className={colors[method] || ""}>
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Payment Verification"
      description="Verify subscription payments from doctors"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Subscription Payments</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.doctor?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{payment.doctor?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="capitalize">
                          {payment.plan_tier}
                        </Badge>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {payment.billing_period}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ৳{payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                    <TableCell>
                      <div>
                        <code className="text-xs bg-muted px-1 rounded">
                          {payment.transaction_id}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {payment.payer_mobile}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                      <br />
                      <span className="text-xs">
                        {format(new Date(payment.created_at), "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => verifyPayment.mutate(payment.id)}
                            disabled={verifyPayment.isPending}
                          >
                            {verifyPayment.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRejectDialog(true);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Invalid transaction ID, amount mismatch..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedPayment) {
                  rejectPayment.mutate({
                    paymentId: selectedPayment.id,
                    reason: rejectReason,
                  });
                }
              }}
              disabled={rejectPayment.isPending}
            >
              {rejectPayment.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedPayment && !showRejectDialog} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{selectedPayment.doctor?.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedPayment.doctor?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plan</Label>
                  <p className="font-medium capitalize">{selectedPayment.plan_tier}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Period</Label>
                  <p className="font-medium capitalize">{selectedPayment.billing_period}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">৳{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Method</Label>
                  <p className="font-medium capitalize">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payer Mobile</Label>
                  <p className="font-medium">{selectedPayment.payer_mobile}</p>
                </div>
              </div>
              {selectedPayment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}