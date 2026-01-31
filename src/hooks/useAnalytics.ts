import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export const useAnalytics = () => {
  const { profile } = useProfile();

  // Patient stats
  const { data: patientStats } = useQuery({
    queryKey: ["analytics-patients", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { total: 0, thisMonth: 0, lastMonth: 0 };

      const thisMonthStart = startOfMonth(new Date());
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const [totalRes, thisMonthRes, lastMonthRes] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", profile.id),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", profile.id)
          .gte("created_at", thisMonthStart.toISOString()),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", profile.id)
          .gte("created_at", lastMonthStart.toISOString())
          .lte("created_at", lastMonthEnd.toISOString()),
      ]);

      return {
        total: totalRes.count || 0,
        thisMonth: thisMonthRes.count || 0,
        lastMonth: lastMonthRes.count || 0,
      };
    },
    enabled: !!profile?.id,
  });

  // Visit trends (last 30 days)
  const { data: visitTrends = [] } = useQuery({
    queryKey: ["analytics-visits", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data } = await supabase
        .from("visits")
        .select("visit_date, fees")
        .eq("doctor_id", profile.id)
        .gte("visit_date", thirtyDaysAgo.toISOString());

      // Group by date
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayVisits = (data || []).filter(
          (v) => format(new Date(v.visit_date), "yyyy-MM-dd") === dateStr
        );
        return {
          date: format(day, "MMM d"),
          visits: dayVisits.length,
          revenue: dayVisits.reduce((sum, v) => sum + (Number(v.fees) || 0), 0),
        };
      });
    },
    enabled: !!profile?.id,
  });

  // Revenue stats
  const { data: revenueStats } = useQuery({
    queryKey: ["analytics-revenue", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { thisMonth: 0, lastMonth: 0, outstanding: 0 };

      const thisMonthStart = startOfMonth(new Date());
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const [thisMonthRes, lastMonthRes, duesRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount")
          .eq("doctor_id", profile.id)
          .eq("type", "income")
          .gte("transaction_date", format(thisMonthStart, "yyyy-MM-dd")),
        supabase
          .from("transactions")
          .select("amount")
          .eq("doctor_id", profile.id)
          .eq("type", "income")
          .gte("transaction_date", format(lastMonthStart, "yyyy-MM-dd"))
          .lte("transaction_date", format(lastMonthEnd, "yyyy-MM-dd")),
        supabase
          .from("transactions")
          .select("amount")
          .eq("doctor_id", profile.id)
          .eq("payment_method", "due"),
      ]);

      return {
        thisMonth: (thisMonthRes.data || []).reduce((sum, t) => sum + Number(t.amount), 0),
        lastMonth: (lastMonthRes.data || []).reduce((sum, t) => sum + Number(t.amount), 0),
        outstanding: (duesRes.data || []).reduce((sum, t) => sum + Number(t.amount), 0),
      };
    },
    enabled: !!profile?.id,
  });

  // Common diagnoses
  const { data: topDiagnoses = [] } = useQuery({
    queryKey: ["analytics-diagnoses", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data } = await supabase
        .from("visits")
        .select("diagnosis")
        .eq("doctor_id", profile.id)
        .not("diagnosis", "is", null);

      const counts: Record<string, number> = {};
      (data || []).forEach((v) => {
        if (v.diagnosis) {
          counts[v.diagnosis] = (counts[v.diagnosis] || 0) + 1;
        }
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
    },
    enabled: !!profile?.id,
  });

  // Patient retention (returning vs new)
  const { data: retentionStats } = useQuery({
    queryKey: ["analytics-retention", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { newPatients: 0, returning: 0 };

      const thisMonthStart = startOfMonth(new Date());

      // Get visits this month with patient info
      const { data: visits } = await supabase
        .from("visits")
        .select("patient_id")
        .eq("doctor_id", profile.id)
        .gte("visit_date", thisMonthStart.toISOString());

      // Get patients created this month
      const { data: newPatients } = await supabase
        .from("patients")
        .select("id")
        .eq("doctor_id", profile.id)
        .gte("created_at", thisMonthStart.toISOString());

      const uniquePatients = new Set((visits || []).map((v) => v.patient_id));
      const newPatientIds = new Set((newPatients || []).map((p) => p.id));

      let returningCount = 0;
      uniquePatients.forEach((id) => {
        if (!newPatientIds.has(id)) returningCount++;
      });

      return {
        newPatients: newPatientIds.size,
        returning: returningCount,
      };
    },
    enabled: !!profile?.id,
  });

  return {
    patientStats: patientStats || { total: 0, thisMonth: 0, lastMonth: 0 },
    visitTrends,
    revenueStats: revenueStats || { thisMonth: 0, lastMonth: 0, outstanding: 0 },
    topDiagnoses,
    retentionStats: retentionStats || { newPatients: 0, returning: 0 },
  };
};
