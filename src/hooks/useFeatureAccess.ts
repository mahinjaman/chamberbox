import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";

export type Feature = 
  | "public_profile"
  | "queue_booking"
  | "whatsapp"
  | "analytics"
  | "export"
  | "branding";

export type LimitType = "patients" | "prescriptions";

export interface FeatureAccessResult {
  hasAccess: boolean;
  planRequired: string | null;
  message: string;
}

export interface LimitCheckResult {
  withinLimit: boolean;
  current: number;
  max: number;
  remaining: number;
  isUnlimited: boolean;
  message: string;
}

export const useFeatureAccess = () => {
  const { currentPlan, usage, isExpired, isLoading } = useSubscription();
  const { profile } = useProfile();

  const checkFeatureAccess = (feature: Feature): FeatureAccessResult => {
    // If plan is expired, deny all features except basic functionality
    if (isExpired) {
      return {
        hasAccess: false,
        planRequired: null,
        message: "Your subscription has expired. Please renew to access this feature.",
      };
    }

    if (!currentPlan) {
      return {
        hasAccess: false,
        planRequired: null,
        message: "Loading subscription details...",
      };
    }

    const featureMap: Record<Feature, { key: keyof typeof currentPlan; planRequired: string }> = {
      public_profile: { key: "can_use_public_profile", planRequired: "Basic" },
      queue_booking: { key: "can_use_queue_booking", planRequired: "Basic" },
      whatsapp: { key: "can_use_whatsapp_notifications", planRequired: "Pro" },
      analytics: { key: "can_use_analytics", planRequired: "Pro" },
      export: { key: "can_export_data", planRequired: "Basic" },
      branding: { key: "can_use_custom_branding", planRequired: "Premium" },
    };

    const config = featureMap[feature];
    const hasAccess = !!currentPlan[config.key];

    if (!hasAccess) {
      return {
        hasAccess: false,
        planRequired: config.planRequired,
        message: `This feature requires ${config.planRequired} plan or higher.`,
      };
    }

    return {
      hasAccess: true,
      planRequired: null,
      message: "",
    };
  };

  // Check if within subscription limits for patients/prescriptions
  const checkLimit = (limitType: LimitType): LimitCheckResult => {
    if (isExpired) {
      return {
        withinLimit: false,
        current: 0,
        max: 0,
        remaining: 0,
        isUnlimited: false,
        message: "Your subscription has expired. Please renew to continue.",
      };
    }

    if (!currentPlan || !usage) {
      return {
        withinLimit: true, // Allow while loading
        current: 0,
        max: 0,
        remaining: 0,
        isUnlimited: false,
        message: "Loading...",
      };
    }

    if (limitType === "patients") {
      const current = usage.total_patients || 0;
      const max = currentPlan.max_patients || 0;
      const isUnlimited = max === -1;
      const remaining = isUnlimited ? Infinity : Math.max(max - current, 0);
      const withinLimit = isUnlimited || current < max;

      return {
        withinLimit,
        current,
        max,
        remaining: isUnlimited ? -1 : remaining,
        isUnlimited,
        message: withinLimit 
          ? "" 
          : `Patient limit reached (${current}/${max}). Please upgrade your plan to add more patients.`,
      };
    }

    if (limitType === "prescriptions") {
      const current = usage.prescriptions_this_month || 0;
      const max = currentPlan.max_prescriptions_per_month || 0;
      const isUnlimited = max === -1;
      const remaining = isUnlimited ? Infinity : Math.max(max - current, 0);
      const withinLimit = isUnlimited || current < max;

      return {
        withinLimit,
        current,
        max,
        remaining: isUnlimited ? -1 : remaining,
        isUnlimited,
        message: withinLimit 
          ? "" 
          : `Monthly prescription limit reached (${current}/${max}). Please upgrade your plan to create more prescriptions.`,
      };
    }

    return {
      withinLimit: true,
      current: 0,
      max: 0,
      remaining: 0,
      isUnlimited: false,
      message: "",
    };
  };

  // Quick check helpers
  const canAddPatient = () => checkLimit("patients").withinLimit;
  const canCreatePrescription = () => checkLimit("prescriptions").withinLimit;

  const canUsePublicProfile = () => checkFeatureAccess("public_profile").hasAccess;
  const canUseQueueBooking = () => checkFeatureAccess("queue_booking").hasAccess;
  const canUseWhatsApp = () => checkFeatureAccess("whatsapp").hasAccess;
  const canUseAnalytics = () => checkFeatureAccess("analytics").hasAccess;
  const canExportData = () => checkFeatureAccess("export").hasAccess;
  const canUseBranding = () => checkFeatureAccess("branding").hasAccess;

  return {
    checkFeatureAccess,
    checkLimit,
    canAddPatient,
    canCreatePrescription,
    canUsePublicProfile,
    canUseQueueBooking,
    canUseWhatsApp,
    canUseAnalytics,
    canExportData,
    canUseBranding,
    isLoading,
    isExpired,
    currentPlan,
  };
};
