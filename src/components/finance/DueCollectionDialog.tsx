import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { Banknote, Smartphone, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dueTransaction: Transaction | null;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
];

export function DueCollectionDialog({
  isOpen,
  onClose,
  dueTransaction,
}: DueCollectionDialogProps) {
  const { addTransaction, deleteTransaction, isAdding } = useTransactions();

  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleCollect = () => {
    if (!dueTransaction || !collectAmount) return;

    const amountToCollect = parseFloat(collectAmount);
    const originalAmount = Number(dueTransaction.amount);

    // Create new transaction for collected amount
    addTransaction({
      amount: amountToCollect,
      type: "income",
      category: dueTransaction.category,
      payment_method: paymentMethod as "cash" | "bkash" | "nagad" | "card",
      description: `Due collected from ${dueTransaction.patient?.name || "patient"}`,
      patient_id: dueTransaction.patient_id,
      visit_id: dueTransaction.visit_id,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });

    // If collecting full amount, delete the due entry
    if (amountToCollect >= originalAmount) {
      deleteTransaction(dueTransaction.id);
    } else {
      // If partial collection, we need to update the original due amount
      // For now, delete old and create new due with remaining
      deleteTransaction(dueTransaction.id);
      addTransaction({
        amount: originalAmount - amountToCollect,
        type: "income",
        category: dueTransaction.category,
        payment_method: "due",
        description: `Remaining due from ${dueTransaction.patient?.name || "patient"}`,
        patient_id: dueTransaction.patient_id,
        visit_id: dueTransaction.visit_id,
        transaction_date: dueTransaction.transaction_date,
      });
    }

    setCollectAmount("");
    setPaymentMethod("cash");
    onClose();
  };

  if (!dueTransaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Due Payment</DialogTitle>
          <DialogDescription>
            Collecting due from {dueTransaction.patient?.name || "Unknown"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Due Amount</p>
                <p className="text-2xl font-bold text-warning">
                  ৳{Number(dueTransaction.amount).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Due Since</p>
                <p className="font-medium text-foreground">
                  {format(new Date(dueTransaction.transaction_date), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Amount to collect */}
          <div className="space-y-2">
            <Label>Amount to Collect (৳)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={collectAmount}
              onChange={(e) => setCollectAmount(e.target.value)}
              max={dueTransaction.amount}
              className="text-lg font-semibold"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollectAmount(dueTransaction.amount.toString())}
              >
                Full Amount
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollectAmount((Number(dueTransaction.amount) / 2).toString())}
              >
                Half
              </Button>
            </div>
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
                >
                  <m.icon className="mr-1 h-4 w-4" />
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCollect}
            disabled={!collectAmount || isAdding}
            className="flex-1 bg-success hover:bg-success/90"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Collect ৳{collectAmount || "0"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
