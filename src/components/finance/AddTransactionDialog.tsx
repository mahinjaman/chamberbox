import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, TransactionInsert } from "@/hooks/useTransactions";
import { usePatients } from "@/hooks/usePatients";
import { 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Banknote,
  Smartphone,
  Clock,
  Loader2,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const INCOME_CATEGORIES = [
  "Consultation Fee",
  "Follow-up Fee",
  "Procedure",
  "Lab Fee",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Chamber Rent",
  "Utility Bills",
  "Staff Salary",
  "Medicine/Supplies",
  "Equipment",
  "Marketing",
  "Other Expense",
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "due", label: "Due", icon: Clock },
];

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransactionDialog = ({ open, onOpenChange }: AddTransactionDialogProps) => {
  const { addTransaction, isAdding } = useTransactions();
  const { patients } = usePatients();

  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [description, setDescription] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  const handleSubmit = () => {
    if (!amount || !category) return;

    const transaction: TransactionInsert = {
      amount: parseFloat(amount),
      type: transactionType,
      category,
      payment_method: transactionType === "income" ? (paymentMethod as any) : null,
      description: description || null,
      patient_id: selectedPatientId || null,
      visit_id: null,
      transaction_date: transactionDate,
    };

    addTransaction(transaction);
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setPaymentMethod("cash");
    setDescription("");
    setSelectedPatientId("");
    setPatientSearch("");
    setTransactionType("income");
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record income or expense
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Type */}
          <div className="flex gap-2">
            <Button
              variant={transactionType === "income" ? "default" : "outline"}
              className={cn("flex-1", transactionType === "income" && "bg-success hover:bg-success/90")}
              onClick={() => setTransactionType("income")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Income
            </Button>
            <Button
              variant={transactionType === "expense" ? "default" : "outline"}
              className={cn("flex-1", transactionType === "expense" && "bg-destructive hover:bg-destructive/90")}
              onClick={() => setTransactionType("expense")}
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Expense
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (৳)</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold h-14"
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
                {(transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method (Income only) */}
          {transactionType === "income" && (
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
                      paymentMethod === m.value && m.value === "due" && "bg-warning hover:bg-warning/90"
                    )}
                  >
                    <m.icon className="mr-1 h-4 w-4" />
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Patient (Income only) */}
          {transactionType === "income" && (
            <div className="space-y-2">
              <Label>Patient (Optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient..."
                  className="pl-10"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              {patientSearch && (
                <div className="border rounded-md max-h-24 overflow-y-auto">
                  {filteredPatients.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setPatientSearch(p.name);
                      }}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!amount || !category || isAdding}
            className="w-full"
          >
            {isAdding ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <>Add Transaction</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
