import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";

export type Feature = 
  | "public_profile"
  | "queue_booking"
  | "whatsapp"
  | "analytics"
  | "export"
  | "branding";

export interface FeatureAccessResult {
  hasAccess: boolean;
  planRequired: string | null;
  message: string;
}

export const useFeatureAccess = () => {
  const { currentPlan, isExpired, isLoading } = useSubscription();
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

  const canUsePublicProfile = () => checkFeatureAccess("public_profile").hasAccess;
  const canUseQueueBooking = () => checkFeatureAccess("queue_booking").hasAccess;
  const canUseWhatsApp = () => checkFeatureAccess("whatsapp").hasAccess;
  const canUseAnalytics = () => checkFeatureAccess("analytics").hasAccess;
  const canExportData = () => checkFeatureAccess("export").hasAccess;
  const canUseBranding = () => checkFeatureAccess("branding").hasAccess;

  return {
    checkFeatureAccess,
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
