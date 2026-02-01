import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { format, eachDayOfInterval, parseISO } from "date-fns";

export interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  category?: string;
}

export interface FilteredAnalyticsData {
  visitTrends: Array<{ date: string; visits: number; revenue: number }>;
  revenueByCategory: Array<{ category: string; amount: number }>;
  patientStats: { total: number; newInRange: number };
  totalRevenue: number;
  totalVisits: number;
  topDiagnoses: Array<{ name: string; count: number }>;
  categoryBreakdown: Array<{ category: string; income: number; expense: number }>;
}

export const useFilteredAnalytics = (filters: AnalyticsFilters) => {
  const { profile } = useProfile();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["filtered-analytics", profile?.id, filters.startDate, filters.endDate, filters.category],
    queryFn: async (): Promise<FilteredAnalyticsData> => {
      if (!profile?.id) {
        return {
          visitTrends: [],
          revenueByCategory: [],
          patientStats: { total: 0, newInRange: 0 },
          totalRevenue: 0,
          totalVisits: 0,
          topDiagnoses: [],
          categoryBreakdown: [],
        };
      }

      const startDateStr = format(filters.startDate, "yyyy-MM-dd");
      const endDateStr = format(filters.endDate, "yyyy-MM-dd");

      // Fetch visits in date range
      const { data: visits } = await supabase
        .from("visits")
        .select("visit_date, fees, diagnosis")
        .eq("doctor_id", profile.id)
        .gte("visit_date", startDateStr)
        .lte("visit_date", endDateStr);

      // Fetch transactions in date range
      let transactionsQuery = supabase
        .from("transactions")
        .select("*")
        .eq("doctor_id", profile.id)
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", endDateStr);

      if (filters.category && filters.category !== "all") {
        transactionsQuery = transactionsQuery.eq("category", filters.category);
      }

      const { data: transactions } = await transactionsQuery;

      // Fetch new patients in date range
      const { count: newPatients } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", profile.id)
        .gte("created_at", filters.startDate.toISOString())
        .lte("created_at", filters.endDate.toISOString());

      // Fetch total patients
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", profile.id);

      // Process visit trends
      const days = eachDayOfInterval({ start: filters.startDate, end: filters.endDate });
      const visitTrends = days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayVisits = (visits || []).filter(
          (v) => format(parseISO(v.visit_date), "yyyy-MM-dd") === dateStr
        );
        return {
          date: format(day, "MMM d"),
          visits: dayVisits.length,
          revenue: dayVisits.reduce((sum, v) => sum + (Number(v.fees) || 0), 0),
        };
      });

      // Process revenue by category
      const categoryMap: Record<string, number> = {};
      (transactions || [])
        .filter((t) => t.type === "income")
        .forEach((t) => {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
        });

      const revenueByCategory = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Process category breakdown (income vs expense)
      const categoryBreakdownMap: Record<string, { income: number; expense: number }> = {};
      (transactions || []).forEach((t) => {
        if (!categoryBreakdownMap[t.category]) {
          categoryBreakdownMap[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === "income") {
          categoryBreakdownMap[t.category].income += Number(t.amount);
        } else {
          categoryBreakdownMap[t.category].expense += Number(t.amount);
        }
      });

      const categoryBreakdown = Object.entries(categoryBreakdownMap)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));

      // Calculate totals
      const totalRevenue = (transactions || [])
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalVisits = (visits || []).length;

      // Process top diagnoses
      const diagnosisCounts: Record<string, number> = {};
      (visits || []).forEach((v) => {
        if (v.diagnosis) {
          diagnosisCounts[v.diagnosis] = (diagnosisCounts[v.diagnosis] || 0) + 1;
        }
      });

      const topDiagnoses = Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      return {
        visitTrends,
        revenueByCategory,
        patientStats: { total: totalPatients || 0, newInRange: newPatients || 0 },
        totalRevenue,
        totalVisits,
        topDiagnoses,
        categoryBreakdown,
      };
    },
    enabled: !!profile?.id,
  });

  return {
    data: data || {
      visitTrends: [],
      revenueByCategory: [],
      patientStats: { total: 0, newInRange: 0 },
      totalRevenue: 0,
      totalVisits: 0,
      topDiagnoses: [],
      categoryBreakdown: [],
    },
    isLoading,
    refetch,
  };
};
