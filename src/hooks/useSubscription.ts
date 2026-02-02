import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface SubscriptionPlan {
  id: string;
  tier: "trial" | "basic" | "pro" | "premium" | "enterprise";
  name: string;
  description: string | null;
  max_patients: number;
  max_staff: number;
  max_chambers: number;
  max_prescriptions_per_month: number;
  sms_credits: number;
  can_use_public_profile: boolean;
  can_use_queue_booking: boolean;
  can_use_whatsapp_notifications: boolean;
  can_use_analytics: boolean;
  can_export_data: boolean;
  can_use_custom_branding: boolean;
  price_monthly: number;
  price_yearly: number;
  price_quarterly: number | null;
  price_biannual: number | null;
  discount_quarterly: number;
  discount_biannual: number;
  discount_yearly: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  id: string;
  doctor_id: string;
  patients_added_this_month: number;
  prescriptions_this_month: number;
  sms_sent_this_month: number;
  current_month: string;
  total_patients: number;
  total_prescriptions: number;
  total_sms_sent: number;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Get current plan details
  const { data: currentPlan, isLoading: planLoading } = useQuery({
    queryKey: ["subscription-plan", profile?.subscription_tier],
    queryFn: async () => {
      const tier = profile?.subscription_tier || "basic";
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("tier", tier)
        .single();
      
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    enabled: !!profile,
  });

  // Get all plans for comparison
  const { data: allPlans = [], isLoading: allPlansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Get usage stats
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["subscription-usage", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from("subscription_usage")
        .select("*")
        .eq("doctor_id", profile.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as SubscriptionUsage | null;
    },
    enabled: !!profile?.id,
  });

  // Calculate limits and percentages
  const getLimitStatus = (used: number, max: number) => {
    if (max === -1) return { percentage: 0, isUnlimited: true, remaining: -1 };
    const percentage = max > 0 ? Math.min((used / max) * 100, 100) : 0;
    const remaining = Math.max(max - used, 0);
    return { percentage, isUnlimited: false, remaining };
  };

  // These will be populated by the components that need them
  const createLimits = (staffCount = 0, chamberCount = 0) => ({
    patients: getLimitStatus(usage?.total_patients || 0, currentPlan?.max_patients || 0),
    patientsMonthly: getLimitStatus(usage?.patients_added_this_month || 0, currentPlan?.max_patients || 0),
    prescriptions: getLimitStatus(usage?.prescriptions_this_month || 0, currentPlan?.max_prescriptions_per_month || 0),
    sms: getLimitStatus(usage?.sms_sent_this_month || 0, currentPlan?.sms_credits || 0),
    staff: getLimitStatus(staffCount, currentPlan?.max_staff || 0),
    chambers: getLimitStatus(chamberCount, currentPlan?.max_chambers || 0),
  });

  const limits = createLimits(0, 0);

  // Subscription expiry info
  const expiresAt = profile?.subscription_expires_at 
    ? new Date(profile.subscription_expires_at) 
    : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Feature checks
  const canUseFeature = (feature: keyof SubscriptionPlan) => {
    if (!currentPlan) return false;
    return !!currentPlan[feature];
  };

  const isWithinLimit = (limitType: keyof typeof limits) => {
    const limit = limits[limitType];
    if (limit.isUnlimited) return true;
    return limit.remaining > 0;
  };

  // Check if can add more of a resource
  const canAddMore = (resourceType: 'staff' | 'chambers', currentCount: number) => {
    if (!currentPlan) return false;
    const maxLimit = resourceType === 'staff' ? currentPlan.max_staff : currentPlan.max_chambers;
    if (maxLimit === -1) return true; // Unlimited
    return currentCount < maxLimit;
  };

  return {
    currentPlan,
    allPlans,
    usage,
    limits,
    createLimits,
    expiresAt,
    isExpired,
    daysRemaining,
    isLoading: planLoading || usageLoading,
    allPlansLoading,
    canUseFeature,
    isWithinLimit,
    canAddMore,
  };
};

// Admin hook for managing subscription plans
export const useSubscriptionAdmin = () => {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ 
      tier, 
      updates 
    }: { 
      tier: SubscriptionPlan["tier"]; 
      updates: Partial<SubscriptionPlan> 
    }) => {
      const { error } = await supabase
        .from("subscription_plans")
        .update(updates)
        .eq("tier", tier);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update plan: " + error.message);
    },
  });

  return {
    plans,
    isLoading,
    updatePlan,
  };
};
