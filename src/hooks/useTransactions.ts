import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";

export interface Transaction {
  id: string;
  doctor_id: string;
  visit_id: string | null;
  patient_id: string | null;
  amount: number;
  type: "income" | "expense";
  category: string;
  payment_method: "cash" | "bkash" | "nagad" | "card" | "due" | "other" | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
  patient?: {
    name: string;
    phone: string;
  } | null;
}

export type TransactionInsert = Omit<Transaction, "id" | "doctor_id" | "created_at" | "patient">;

export const useTransactions = (dateRange?: { from: Date; to: Date }) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const today = new Date();
  const defaultFrom = startOfMonth(today);
  const defaultTo = endOfMonth(today);

  const from = dateRange?.from || defaultFrom;
  const to = dateRange?.to || defaultTo;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", profile?.id, format(from, "yyyy-MM-dd"), format(to, "yyyy-MM-dd")],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          patient:patients(name, phone)
        `)
        .eq("doctor_id", profile.id)
        .gte("transaction_date", format(from, "yyyy-MM-dd"))
        .lte("transaction_date", format(to, "yyyy-MM-dd"))
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!profile?.id,
  });

  const { data: todayStats } = useQuery({
    queryKey: ["transactions-today", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { income: 0, expense: 0, cash: 0, digital: 0, dues: 0 };
      
      const todayStr = format(today, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, payment_method")
        .eq("doctor_id", profile.id)
        .eq("transaction_date", todayStr);

      if (error) throw error;

      const stats = {
        income: 0,
        expense: 0,
        cash: 0,
        digital: 0,
        dues: 0,
      };

      (data || []).forEach((t) => {
        if (t.type === "income") {
          stats.income += Number(t.amount);
          if (t.payment_method === "cash") stats.cash += Number(t.amount);
          else if (t.payment_method === "due") stats.dues += Number(t.amount);
          else stats.digital += Number(t.amount);
        } else {
          stats.expense += Number(t.amount);
        }
      });

      return stats;
    },
    enabled: !!profile?.id,
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      if (!profile?.id) throw new Error("Profile not loaded");
      
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transaction,
          doctor_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-today"] });
      toast.success("Transaction recorded");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-today"] });
      toast.success("Transaction deleted");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Calculate summary
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.totalIncome += Number(t.amount);
      else acc.totalExpense += Number(t.amount);
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  // Group by category
  const byCategory = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return {
    transactions,
    isLoading,
    todayStats: todayStats || { income: 0, expense: 0, cash: 0, digital: 0, dues: 0 },
    summary,
    byCategory,
    addTransaction: addTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isAdding: addTransaction.isPending,
  };
};
