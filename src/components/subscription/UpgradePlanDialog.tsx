import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSubscription, SubscriptionPlan } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Crown,
  Check,
  Loader2,
  Copy,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select-plan" | "select-billing" | "payment" | "success";
type BillingPeriod = "monthly" | "quarterly" | "biannual" | "yearly";

const BILLING_OPTIONS: { 
  id: BillingPeriod; 
  label: string; 
  description: string; 
  months: number;
  discount: number; 
}[] = [
  { id: "monthly", label: "Monthly", description: "Billed every month", months: 1, discount: 0 },
  { id: "quarterly", label: "3 Months", description: "Billed every 3 months", months: 3, discount: 5 },
  { id: "biannual", label: "6 Months", description: "Billed every 6 months", months: 6, discount: 10 },
  { id: "yearly", label: "Yearly", description: "Billed annually", months: 12, discount: 17 },
];

const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", color: "#E2136E", number: "01712345678" },
  { id: "nagad", name: "Nagad", color: "#F6921E", number: "01812345678" },
  { id: "rocket", name: "Rocket", color: "#8C3494", number: "01512345678" },
];

export const UpgradePlanDialog = ({ open, onOpenChange }: UpgradePlanDialogProps) => {
  const { currentPlan, allPlans } = useSubscription();
  const { profile } = useProfile();
  const [step, setStep] = useState<Step>("select-plan");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [payerMobile, setPayerMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePlans = allPlans.filter(
    (plan) => plan.tier !== "trial" && plan.tier !== currentPlan?.tier
  );

  // Calculate price based on billing period
  const calculatePrice = (plan: SubscriptionPlan | null, period: BillingPeriod): number => {
    if (!plan) return 0;
    const option = BILLING_OPTIONS.find(o => o.id === period);
    if (!option) return 0;
    
    if (period === "yearly" && plan.price_yearly) {
      return plan.price_yearly;
    }
    
    const monthlyPrice = plan.price_monthly || 0;
    const totalBeforeDiscount = monthlyPrice * option.months;
    const discountAmount = totalBeforeDiscount * (option.discount / 100);
    return Math.round(totalBeforeDiscount - discountAmount);
  };

  const selectedPrice = calculatePrice(selectedPlan, billingPeriod);
  const currentBillingOption = BILLING_OPTIONS.find(o => o.id === billingPeriod);

  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim() || !payerMobile.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^01[0-9]{9}$/.test(payerMobile)) {
      toast.error("Invalid mobile number format (01XXXXXXXXX)");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("subscription_payments").insert({
        doctor_id: profile?.id,
        plan_tier: selectedPlan?.tier,
        billing_period: billingPeriod,
        amount: selectedPrice,
        payment_method: selectedPaymentMethod,
        transaction_id: transactionId.trim(),
        payer_mobile: payerMobile.trim(),
        status: "pending",
      });

      if (error) throw error;

      setStep("success");
      toast.success("Payment submitted for verification!");
    } catch (error: any) {
      toast.error("Failed to submit payment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setStep("select-plan");
    setSelectedPlan(null);
    setBillingPeriod("monthly");
    setTransactionId("");
    setPayerMobile("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetDialog, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {step === "select-plan" && "Choose Your Plan"}
            {step === "select-billing" && "Select Billing Period"}
            {step === "payment" && "Complete Payment"}
            {step === "success" && "Payment Submitted"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Plan */}
          {step === "select-plan" && (
            <motion.div
              key="select-plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Current plan: <Badge variant="outline" className="capitalize">{currentPlan?.name}</Badge>
              </p>

              <div className="space-y-3">
                {availablePlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedPlan?.id === plan.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ৳{plan.price_monthly?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {plan.max_patients === -1 ? "Unlimited" : plan.max_patients} patients
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {plan.max_chambers === -1 ? "Unlimited" : plan.max_chambers} chambers
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {plan.sms_credits === -1 ? "Unlimited" : plan.sms_credits} SMS
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                className="w-full"
                disabled={!selectedPlan}
                onClick={() => setStep("select-billing")}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Select Billing Period */}
          {step === "select-billing" && (
            <motion.div
              key="select-billing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <h3 className="text-xl font-bold">{selectedPlan?.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ৳{selectedPlan?.price_monthly?.toLocaleString()}/month base price
                </p>
              </div>

              <RadioGroup
                value={billingPeriod}
                onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}
                className="space-y-3"
              >
                {BILLING_OPTIONS.map((option) => {
                  const price = calculatePrice(selectedPlan, option.id);
                  const monthlyEquivalent = Math.round(price / option.months);
                  
                  return (
                    <Label
                      key={option.id}
                      htmlFor={option.id}
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all relative",
                        billingPeriod === option.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:border-primary/50"
                      )}
                    >
                      {option.discount > 0 && (
                        <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs">
                          Save {option.discount}%
                        </Badge>
                      )}
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                          {option.months > 1 && (
                            <p className="text-xs text-primary mt-0.5">
                              ≈ ৳{monthlyEquivalent?.toLocaleString()}/month
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold">
                        ৳{price?.toLocaleString()}
                      </p>
                    </Label>
                  );
                })}
              </RadioGroup>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("select-plan")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("payment")}>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Payment Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium capitalize">{billingPeriod}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2 mt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">
                    ৳{selectedPrice?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="grid grid-cols-3 gap-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={cn(
                        "flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all",
                        selectedPaymentMethod === method.id
                          ? "border-primary ring-2 ring-primary/20"
                          : ""
                      )}
                    >
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: method.color }}
                      >
                        {method.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium mt-1">{method.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Instructions */}
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Smartphone className="w-4 h-4" />
                    Payment Instructions
                  </div>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Open your <strong>{paymentMethod?.name}</strong> app</li>
                    <li>Choose: <strong>Send Money</strong></li>
                    <li className="flex items-center gap-2 flex-wrap">
                      Enter the Number: 
                      <code className="px-2 py-0.5 bg-muted rounded font-mono">
                        {paymentMethod?.number}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6"
                        onClick={() => handleCopy(paymentMethod?.number || "")}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </li>
                    <li className="flex items-center gap-2 flex-wrap">
                      Enter the Amount: 
                      <code className="px-2 py-0.5 bg-muted rounded font-mono">
                        {selectedPrice} BDT
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6"
                        onClick={() => handleCopy(selectedPrice.toString())}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </li>
                    <li>Enter your PIN to confirm</li>
                    <li>Copy the <strong>Transaction ID</strong> below</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payerMobile">Your Mobile Number *</Label>
                  <Input
                    id="payerMobile"
                    placeholder="01XXXXXXXXX"
                    value={payerMobile}
                    onChange={(e) => setPayerMobile(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The number you used to send payment
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("select-billing")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitPayment}
                  disabled={isSubmitting || !transactionId || !payerMobile}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Verify Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Payment Submitted!</h3>
              <p className="text-muted-foreground">
                Your payment is being verified. Once confirmed, your plan will be upgraded automatically.
                This usually takes 1-24 hours.
              </p>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};