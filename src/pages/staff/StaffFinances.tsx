import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function StaffFinances() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("this_month");

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "this_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last_month":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "last_3_months":
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();

  // Fetch transactions for the doctor
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["staff_transactions", doctorId, dateRange],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          patient:patients(name, phone)
        `)
        .eq("doctor_id", doctorId)
        .gte("transaction_date", format(start, "yyyy-MM-dd"))
        .lte("transaction_date", format(end, "yyyy-MM-dd"))
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewFinances) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "আর্থিক" : "Finances"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewFinances) {
    return null;
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StaffLayout 
      title={language === "bn" ? "আর্থিক" : "Finances"}
      description={language === "bn" ? "শুধুমাত্র দেখার জন্য" : "View only access"}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">৳{totalIncome.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "মোট আয়" : "Total Income"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">৳{totalExpense.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "মোট ব্যয়" : "Total Expenses"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">৳{(totalIncome - totalExpense).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "নিট আয়" : "Net Balance"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === "bn" ? "খুঁজুন..." : "Search transactions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">
                {language === "bn" ? "এই মাস" : "This Month"}
              </SelectItem>
              <SelectItem value="last_month">
                {language === "bn" ? "গত মাস" : "Last Month"}
              </SelectItem>
              <SelectItem value="last_3_months">
                {language === "bn" ? "গত ৩ মাস" : "Last 3 Months"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "bn" ? "লেনদেন" : "Transactions"}</CardTitle>
            <CardDescription>
              {filteredTransactions.length} {language === "bn" ? "টি রেকর্ড" : "records"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{language === "bn" ? "কোনো লেনদেন নেই" : "No transactions found"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === "income" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}>
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || transaction.category}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(transaction.transaction_date), "dd MMM yyyy")}</span>
                          {transaction.patient?.name && (
                            <>
                              <span>•</span>
                              <span>{transaction.patient.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}৳{transaction.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.payment_method || "cash"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
