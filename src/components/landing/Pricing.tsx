import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const staticText = {
  en: {
    title: "Simple, Transparent Pricing",
    subtitle: "Start with a 30-day free trial. No credit card required. Cancel anytime.",
    mostPopular: "Most Popular",
    month: "/month",
    free: "Free",
    startTrial: "Start Free Trial",
    startFree: "Start Free",
    contactSales: "Contact Sales",
    getStarted: "Get Started",
    unlimited: "Unlimited",
    patients: "patients",
    patientsPerMonth: "patients/month",
    smsCredits: "SMS credits/month",
    staff: "user",
    staffPlural: "users",
    chambers: "chamber",
    chambersPlural: "chambers",
    prescriptions: "prescriptions/month",
    analytics: "Analytics & Reports",
    dataExport: "Data Export",
    publicProfile: "Public Profile & Booking",
    customBranding: "Custom Branding",
    whatsapp: "WhatsApp Notifications",
    queueBooking: "Queue Booking",
  },
  bn: {
    title: "সহজ, স্বচ্ছ মূল্য",
    subtitle: "৩০ দিনের ফ্রি ট্রায়াল দিয়ে শুরু করুন। ক্রেডিট কার্ড লাগবে না। যেকোনো সময় বাতিল করুন।",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    month: "/মাস",
    free: "ফ্রি",
    startTrial: "ফ্রি ট্রায়াল শুরু করুন",
    startFree: "ফ্রি শুরু করুন",
    contactSales: "যোগাযোগ করুন",
    getStarted: "শুরু করুন",
    unlimited: "আনলিমিটেড",
    patients: "রোগী",
    patientsPerMonth: "রোগী/মাস",
    smsCredits: "SMS ক্রেডিট/মাস",
    staff: "ব্যবহারকারী",
    staffPlural: "ব্যবহারকারী",
    chambers: "চেম্বার",
    chambersPlural: "চেম্বার",
    prescriptions: "প্রেসক্রিপশন/মাস",
    analytics: "অ্যানালিটিক্স ও রিপোর্ট",
    dataExport: "ডেটা এক্সপোর্ট",
    publicProfile: "পাবলিক প্রোফাইল ও বুকিং",
    customBranding: "কাস্টম ব্র্যান্ডিং",
    whatsapp: "হোয়াটসঅ্যাপ নোটিফিকেশন",
    queueBooking: "কিউ বুকিং",
  },
};

// Define display order and which tier is "popular"
const TIER_ORDER = ["trial", "basic", "pro", "premium", "enterprise"];
const POPULAR_TIER = "pro";

const Pricing = () => {
  const { language } = useLanguage();
  const t = staticText[language];

  const { data: plans, isLoading } = useQuery({
    queryKey: ["publicSubscriptionPlans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // cache 10min
  });

  const buildFeatures = (plan: any): string[] => {
    const features: string[] = [];

    // Patients
    if (plan.max_patients === -1) {
      features.push(`${t.unlimited} ${t.patients}`);
    } else if (plan.max_patients) {
      features.push(`${plan.max_patients} ${t.patientsPerMonth}`);
    }

    // SMS
    if (plan.sms_credits === -1) {
      features.push(`${t.unlimited} SMS`);
    } else if (plan.sms_credits) {
      features.push(`${plan.sms_credits} ${t.smsCredits}`);
    }

    // Staff
    if (plan.max_staff === -1) {
      features.push(`${t.unlimited} ${t.staffPlural}`);
    } else if (plan.max_staff != null) {
      const staffCount = (plan.max_staff || 0) + 1; // +1 for the doctor
      features.push(`${staffCount} ${staffCount > 1 ? t.staffPlural : t.staff}`);
    }

    // Chambers
    if (plan.max_chambers === -1) {
      features.push(`${t.unlimited} ${t.chambersPlural}`);
    } else if (plan.max_chambers && plan.max_chambers > 1) {
      features.push(`${plan.max_chambers} ${t.chambersPlural}`);
    }

    // Prescriptions
    if (plan.max_prescriptions_per_month === -1) {
      features.push(`${t.unlimited} ${t.prescriptions}`);
    } else if (plan.max_prescriptions_per_month) {
      features.push(`${plan.max_prescriptions_per_month} ${t.prescriptions}`);
    }

    // Boolean features
    if (plan.can_use_analytics) features.push(t.analytics);
    if (plan.can_export_data) features.push(t.dataExport);
    if (plan.can_use_public_profile) features.push(t.publicProfile);
    if (plan.can_use_whatsapp_notifications) features.push(t.whatsapp);
    if (plan.can_use_custom_branding) features.push(t.customBranding);

    return features;
  };

  const getCta = (tier: string) => {
    if (tier === "trial") return t.startTrial;
    if (tier === "basic") return t.startFree;
    if (tier === "enterprise") return t.contactSales;
    return t.getStarted;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return t.free;
    return `BDT ${price.toLocaleString()}`;
  };

  // Sort by defined order
  const sortedPlans = plans
    ? [...plans].sort(
        (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
      )
    : [];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-8 max-w-6xl mx-auto",
              sortedPlans.length <= 3
                ? "grid-cols-1 md:grid-cols-3"
                : sortedPlans.length === 4
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {sortedPlans.map((plan) => {
              const isPopular = plan.tier === POPULAR_TIER;
              const features = buildFeatures(plan);
              const isFree = plan.price_monthly === 0;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative bg-card rounded-2xl p-8 shadow-lg border transition-all duration-300",
                    isPopular
                      ? "border-primary scale-105 shadow-glow"
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        {t.mostPopular}
                      </div>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(plan.price_monthly || 0)}
                      </span>
                      {!isFree && (
                        <span className="text-muted-foreground">{t.month}</span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3 mb-8">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to="/signup">{getCta(plan.tier)}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
