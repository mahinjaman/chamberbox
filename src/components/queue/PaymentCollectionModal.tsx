import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { Banknote, Smartphone, CreditCard, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
    phone?: string;
    isFollowUp?: boolean;
  } | null;
  tokenNumber?: number;
  onSuccess?: (amount: number, method: string) => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "due", label: "Due", icon: Clock },
];

const CATEGORIES = [
  "Consultation Fee",
  "Follow-up Fee",
  "Procedure",
  "Lab Fee",
  "Other Income",
];

const QUICK_AMOUNTS = [300, 500, 800, 1000, 1500, 2000];

export function PaymentCollectionModal({
  isOpen,
  onClose,
  patient,
  tokenNumber,
  onSuccess,
}: PaymentCollectionModalProps) {
  const { addTransaction, isAdding } = useTransactions();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(patient?.isFollowUp ? "Follow-up Fee" : "Consultation Fee");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!amount || !patient) return;

    addTransaction({
      amount: parseFloat(amount),
      type: "income",
      category,
      payment_method: paymentMethod as "cash" | "bkash" | "nagad" | "card" | "due",
      description: description || `Token #${tokenNumber}`,
      patient_id: patient.id,
      visit_id: null,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });

    // Reset form
    const collectedAmount = parseFloat(amount);
    const collectedMethod = paymentMethod;
    setAmount("");
    setCategory("Consultation Fee");
    setPaymentMethod("cash");
    setDescription("");
    
    onSuccess?.(collectedAmount, collectedMethod);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            {patient?.name} - Token #{tokenNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick Amount Selection */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === amt.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(amt.toString())}
                >
                  ৳{amt}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label>Amount (৳)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Button
                  key={m.value}
                  variant={paymentMethod === m.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod(m.value)}
                  className={cn(
                    paymentMethod === m.value && m.value === "due" && "bg-warning hover:bg-warning/90 text-warning-foreground"
                  )}
                >
                  <m.icon className="mr-1 h-4 w-4" />
                  {m.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip Payment
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || isAdding}
            className="flex-1 bg-success hover:bg-success/90"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Collect ৳{amount || "0"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
