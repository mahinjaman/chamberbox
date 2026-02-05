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
import { Search, Loader2, Check, X, Eye, Clock, MoreHorizontal, StickyNote, RotateCcw, Plus, Filter } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addMonths, addYears } from "date-fns";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { TrendingUp, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

// Payment Summary Cards Component
function PaymentSummaryCards({ payments }: { payments: SubscriptionPayment[] }) {
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

  // Growth percentage
  const growth = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
    : thisMonthTotal > 0 ? "100" : "0";

  return (
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
      
      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Pending</span>
        </div>
        <p className="text-2xl font-bold">৳{pendingTotal.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {pendingPayments.length} awaiting verification
        </p>
      </div>
      
      <div className="bg-green-500/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">All Time</span>
        </div>
        <p className="text-2xl font-bold">৳{allTimeTotal.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {allTimeVerified.length} total verified
        </p>
      </div>
    </div>
  );
}

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [doctorSearchOpen, setDoctorSearchOpen] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [newPayment, setNewPayment] = useState({
    doctor_id: "",
    plan_tier: "basic",
    billing_period: "monthly",
    amount: "",
    payment_method: "bkash",
    transaction_id: "",
    payer_mobile: "",
    notes: "",
  });

  // Fetch doctors for selection
  const { data: doctors = [] } = useQuery({
    queryKey: ["admin-doctors-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const filteredDoctors = doctors.filter((doctor) => {
    const query = doctorSearchQuery.toLowerCase();
    return (
      doctor.full_name?.toLowerCase().includes(query) ||
      doctor.email?.toLowerCase().includes(query) ||
      doctor.phone?.includes(doctorSearchQuery)
    );
  });

  const selectedDoctor = doctors.find((d) => d.id === newPayment.doctor_id);

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

      // Calculate expiry date based on billing period
      const getExpiryDate = () => {
        switch (payment.billing_period) {
          case "yearly":
            return addYears(new Date(), 1);
          case "biannual":
            return addMonths(new Date(), 6);
          case "quarterly":
            return addMonths(new Date(), 3);
          case "monthly":
          default:
            return addMonths(new Date(), 1);
        }
      };
      const expiresAt = getExpiryDate();

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
          admin_notes: reason,
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

  const updateNotes = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      const { error } = await supabase
        .from("subscription_payments" as any)
        .update({
          admin_notes: notes,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Notes updated successfully");
      setShowNotesDialog(false);
      setSelectedPayment(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error("Failed to update notes: " + error.message);
    },
  });

  const resetToPending = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("subscription_payments" as any)
        .update({
          status: "pending",
          verified_at: null,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Payment reset to pending");
    },
    onError: (error: any) => {
      toast.error("Failed to reset: " + error.message);
    },
  });

  const handleOpenNotes = (payment: SubscriptionPayment) => {
    setSelectedPayment(payment);
    setAdminNotes((payment as any).admin_notes || "");
    setShowNotesDialog(true);
  };

  const addManualPayment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("subscription_payments" as any)
        .insert({
          doctor_id: newPayment.doctor_id,
          plan_tier: newPayment.plan_tier,
          billing_period: newPayment.billing_period,
          amount: parseFloat(newPayment.amount),
          payment_method: newPayment.payment_method,
          transaction_id: newPayment.transaction_id,
          payer_mobile: newPayment.payer_mobile,
          status: "verified",
          verified_at: new Date().toISOString(),
          admin_notes: newPayment.notes || "Manual payment added by admin",
        });

      if (error) throw error;

      // Update doctor subscription
      const getExpiryDate = () => {
        switch (newPayment.billing_period) {
          case "yearly":
            return addYears(new Date(), 1);
          case "biannual":
            return addMonths(new Date(), 6);
          case "quarterly":
            return addMonths(new Date(), 3);
          case "monthly":
          default:
            return addMonths(new Date(), 1);
        }
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: newPayment.plan_tier as any,
          subscription_expires_at: getExpiryDate().toISOString(),
        })
        .eq("id", newPayment.doctor_id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Manual payment added and subscription updated!");
      setShowAddPaymentDialog(false);
      setNewPayment({
        doctor_id: "",
        plan_tier: "basic",
        billing_period: "monthly",
        amount: "",
        payment_method: "bkash",
        transaction_id: "",
        payer_mobile: "",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add payment: " + error.message);
    },
  });

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.doctor?.full_name?.toLowerCase().includes(searchLower) ||
      payment.doctor?.email?.toLowerCase().includes(searchLower) ||
      payment.transaction_id.toLowerCase().includes(searchLower) ||
      payment.payer_mobile.includes(searchQuery)
    ) &&
    (statusFilter === "all" || payment.status === statusFilter) &&
    (methodFilter === "all" || payment.payment_method === methodFilter) &&
    (planFilter === "all" || payment.plan_tier === planFilter);
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
      {/* Summary Cards at Top */}
      <PaymentSummaryCards payments={payments} />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Subscription Payments</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Button onClick={() => setShowAddPaymentDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Payment
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone or TxnID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenNotes(payment)}>
                              <StickyNote className="w-4 h-4 mr-2" />
                              {(payment as any).admin_notes ? "Edit Notes" : "Add Notes"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => resetToPending.mutate(payment.id)}
                              disabled={resetToPending.isPending}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset to Pending
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes</DialogTitle>
            <DialogDescription>
              Add or edit notes for this payment record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPayment && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium">{selectedPayment.doctor?.full_name}</p>
                <p className="text-muted-foreground">
                  {selectedPayment.plan_tier} - ৳{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes about this payment..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPayment) {
                  updateNotes.mutate({
                    paymentId: selectedPayment.id,
                    notes: adminNotes,
                  });
                }
              }}
              disabled={updateNotes.isPending}
            >
              {updateNotes.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedPayment && !showRejectDialog && !showNotesDialog} onOpenChange={() => setSelectedPayment(null)}>
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
                  <Label className="text-muted-foreground">Rejection Notes</Label>
                  <p className="mt-1">{(selectedPayment as any).admin_notes}</p>
                </div>
              )}
              {(selectedPayment as any).admin_notes && selectedPayment.status !== "rejected" && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{(selectedPayment as any).admin_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Manual Payment Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Manual Payment</DialogTitle>
            <DialogDescription>
              Record a manual payment and update doctor subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Popover open={doctorSearchOpen} onOpenChange={setDoctorSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={doctorSearchOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedDoctor
                      ? `${selectedDoctor.full_name} (${selectedDoctor.email})`
                      : "Search doctor..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name, phone or email..."
                      value={doctorSearchQuery}
                      onValueChange={setDoctorSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No doctor found.</CommandEmpty>
                      <CommandGroup>
                        {filteredDoctors.slice(0, 10).map((doctor) => (
                          <CommandItem
                            key={doctor.id}
                            value={doctor.id}
                            onSelect={() => {
                              setNewPayment({ ...newPayment, doctor_id: doctor.id });
                              setDoctorSearchOpen(false);
                              setDoctorSearchQuery("");
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{doctor.full_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {doctor.email} {doctor.phone && `• ${doctor.phone}`}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={newPayment.plan_tier}
                  onValueChange={(value) => setNewPayment({ ...newPayment, plan_tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Period</Label>
                <Select
                  value={newPayment.billing_period}
                  onValueChange={(value) => setNewPayment({ ...newPayment, billing_period: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannual">Biannual</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (৳)</Label>
                <Input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={newPayment.payment_method}
                  onValueChange={(value) => setNewPayment({ ...newPayment, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Input
                  value={newPayment.transaction_id}
                  onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
                  placeholder="TRX123456"
                />
              </div>
              <div className="space-y-2">
                <Label>Payer Mobile</Label>
                <Input
                  value={newPayment.payer_mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setNewPayment({ ...newPayment, payer_mobile: value });
                  }}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addManualPayment.mutate()}
              disabled={
                addManualPayment.isPending ||
                !newPayment.doctor_id ||
                !newPayment.amount ||
                !newPayment.transaction_id ||
                !newPayment.payer_mobile
              }
            >
              {addManualPayment.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}