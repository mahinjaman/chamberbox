import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions, TransactionInsert, Transaction } from "@/hooks/useTransactions";
import { usePatients } from "@/hooks/usePatients";
import { DueCollectionDialog } from "@/components/finance/DueCollectionDialog";
import { 
  CreditCard, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Banknote,
  Smartphone,
  Clock,
  Trash2,
  Download,
  Loader2,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
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

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "due", label: "Due", icon: Clock },
];

const DATE_PRESETS = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Last 3 Months", value: "3-months" },
  { label: "Custom", value: "custom" },
];

const Finances = () => {
  const [datePreset, setDatePreset] = useState("this-month");
  const [customFromDate, setCustomFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [customToDate, setCustomToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("transactions");

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const today = new Date();
    switch (datePreset) {
      case "last-month":
        return {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
        };
      case "3-months":
        return {
          from: startOfMonth(subMonths(today, 2)),
          to: endOfMonth(today),
        };
      case "custom":
        return {
          from: new Date(customFromDate),
          to: new Date(customToDate),
        };
      default: // this-month
        return {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
    }
  }, [datePreset, customFromDate, customToDate]);

  const { transactions, isLoading, todayStats, summary, addTransaction, deleteTransaction, isAdding } = useTransactions(dateRange);
  const { patients } = usePatients();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDueCollectionOpen, setIsDueCollectionOpen] = useState(false);
  const [selectedDueTransaction, setSelectedDueTransaction] = useState<Transaction | null>(null);
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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPaymentMethod !== "all" && t.payment_method !== filterPaymentMethod) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, filterPaymentMethod]);

  // Get due transactions
  const dueTransactions = useMemo(() => {
    return transactions.filter((t) => t.payment_method === "due" && t.type === "income");
  }, [transactions]);

  const totalDues = useMemo(() => {
    return dueTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [dueTransactions]);

  // Category-wise breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach((t) => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        breakdown[t.category].income += Number(t.amount);
      } else {
        breakdown[t.category].expense += Number(t.amount);
      }
    });
    return breakdown;
  }, [filteredTransactions]);

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
    setAmount("");
    setCategory("");
    setPaymentMethod("cash");
    setDescription("");
    setSelectedPatientId("");
    setPatientSearch("");
    setIsDialogOpen(false);
  };

  const handleCollectDue = (transaction: Transaction) => {
    setSelectedDueTransaction(transaction);
    setIsDueCollectionOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Payment Method", "Description", "Patient"];
    const rows = filteredTransactions.map((t) => [
      t.transaction_date,
      t.type,
      t.category,
      t.amount.toString(),
      t.payment_method || "",
      t.description || "",
      t.patient?.name || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <DashboardLayout
      title="Financial Tracking"
      description="Track your chamber earnings, dues, and expenses"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
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
        </div>
      }
    >
      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">৳{todayStats.income.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Today's Income</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">৳{todayStats.cash.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Cash</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">৳{todayStats.digital.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Digital (bKash/Nagad)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-warning/5 border-warning/20 cursor-pointer hover:bg-warning/10 transition-colors"
          onClick={() => setActiveTab("dues")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">৳{totalDues.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Dues ({dueTransactions.length})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Date Range */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Preset */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date Range</Label>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {datePreset === "custom" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
              </>
            )}

            {/* Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Payment</Label>
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(filterType !== "all" || filterCategory !== "all" || filterPaymentMethod !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterPaymentMethod("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Transactions, Category Breakdown, Dues */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="dues" className="relative">
            Dues
            {dueTransactions.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {dueTransactions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Period Overview</CardTitle>
                <CardDescription>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-success/5">
                    <p className="text-3xl font-bold text-success">৳{summary.totalIncome.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Income</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-destructive/5">
                    <p className="text-3xl font-bold text-destructive">৳{summary.totalExpense.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Expense</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <p className="text-3xl font-bold text-primary">
                      ৳{(summary.totalIncome - summary.totalExpense).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Net Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[500, 800, 1000, 1500].map((fee) => (
                  <Button
                    key={fee}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {
                      addTransaction({
                        amount: fee,
                        type: "income",
                        category: "Consultation Fee",
                        payment_method: "cash",
                        description: null,
                        patient_id: null,
                        visit_id: null,
                        transaction_date: format(new Date(), "yyyy-MM-dd"),
                      });
                    }}
                  >
                    <span>Consultation Fee</span>
                    <Badge variant="secondary">৳{fee}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>
                {filterType !== "all" || filterCategory !== "all" || filterPaymentMethod !== "all" 
                  ? "Filtered results" 
                  : "All transactions in selected period"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                  <Button
                    variant="link"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Add your first transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            t.type === "income" ? "bg-success/10" : "bg-destructive/10"
                          )}
                        >
                          {t.type === "income" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.patient?.name && `${t.patient.name} • `}
                            {format(new Date(t.transaction_date), "dd MMM")}
                            {t.payment_method && ` • ${t.payment_method}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={cn(
                            "text-lg font-bold",
                            t.type === "income" ? "text-success" : "text-destructive"
                          )}
                        >
                          {t.type === "income" ? "+" : "-"}৳{Number(t.amount).toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTransaction(t.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Income and expenses by category for selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryBreakdown).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions to analyze</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryBreakdown)
                    .sort((a, b) => (b[1].income + b[1].expense) - (a[1].income + a[1].expense))
                    .map(([cat, data]) => (
                      <div key={cat} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">{cat}</p>
                          <div className="flex gap-4">
                            {data.income > 0 && (
                              <span className="text-success font-semibold">
                                +৳{data.income.toLocaleString()}
                              </span>
                            )}
                            {data.expense > 0 && (
                              <span className="text-destructive font-semibold">
                                -৳{data.expense.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success"
                            style={{
                              width: `${(data.income / (summary.totalIncome || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dues Tab */}
        <TabsContent value="dues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Outstanding Dues
              </CardTitle>
              <CardDescription>
                Pending payments to collect from patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dueTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success opacity-50" />
                  <p>No outstanding dues! All payments collected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dueTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {t.patient?.name || "Unknown Patient"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t.category} • Due since {format(new Date(t.transaction_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-warning">
                          ৳{Number(t.amount).toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleCollectDue(t)}
                          className="bg-success hover:bg-success/90"
                        >
                          <Banknote className="mr-2 h-4 w-4" />
                          Collect
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted mt-4">
                    <p className="font-medium text-foreground">Total Outstanding</p>
                    <p className="text-xl font-bold text-warning">
                      ৳{totalDues.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Due Collection Dialog */}
      <DueCollectionDialog
        isOpen={isDueCollectionOpen}
        onClose={() => {
          setIsDueCollectionOpen(false);
          setSelectedDueTransaction(null);
        }}
        dueTransaction={selectedDueTransaction}
      />
    </DashboardLayout>
  );
};

export default Finances;
