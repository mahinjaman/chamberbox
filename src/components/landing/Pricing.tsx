import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const pricingText = {
  en: {
    title: "Simple, Transparent Pricing",
    subtitle: "Start with a 30-day free trial. No credit card required. Cancel anytime.",
    mostPopular: "Most Popular",
    plans: [
      {
        name: "Basic",
        price: "Free",
        description: "For doctors just getting started",
        features: ["100 patients/month", "20 SMS credits/month", "1 user (Doctor only)", "7 days cloud backup", "Basic reports", "Community support"],
        cta: "Start Free",
        popular: false,
      },
      {
        name: "Pro",
        price: "৳500",
        period: "/month",
        description: "For growing practices",
        features: ["Unlimited patients", "200 SMS credits/month", "2 users (Doctor + Assistant)", "1 year cloud backup", "Advanced reports + Export", "WhatsApp support", "Logo on prescriptions"],
        cta: "Start 30-Day Trial",
        popular: true,
      },
      {
        name: "Premium",
        price: "৳1,000",
        period: "/month",
        description: "For multi-chamber practices",
        features: ["Unlimited patients", "Unlimited SMS", "5 users (Multi-chamber)", "Lifetime cloud backup", "Custom reports", "Phone + Priority support", "Full prescription branding", "Multiple chamber locations"],
        cta: "Contact Sales",
        popular: false,
      },
    ],
  },
  bn: {
    title: "সহজ, স্বচ্ছ মূল্য",
    subtitle: "৩০ দিনের ফ্রি ট্রায়াল দিয়ে শুরু করুন। ক্রেডিট কার্ড লাগবে না। যেকোনো সময় বাতিল করুন।",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    plans: [
      {
        name: "বেসিক",
        price: "ফ্রি",
        description: "নতুন ডাক্তারদের জন্য",
        features: ["১০০ রোগী/মাস", "২০ SMS ক্রেডিট/মাস", "১ ব্যবহারকারী (শুধু ডাক্তার)", "৭ দিনের ক্লাউড ব্যাকআপ", "বেসিক রিপোর্ট", "কমিউনিটি সাপোর্ট"],
        cta: "ফ্রি শুরু করুন",
        popular: false,
      },
      {
        name: "প্রো",
        price: "৳৫০০",
        period: "/মাস",
        description: "বাড়তে থাকা প্র্যাকটিসের জন্য",
        features: ["আনলিমিটেড রোগী", "২০০ SMS ক্রেডিট/মাস", "২ ব্যবহারকারী (ডাক্তার + সহকারী)", "১ বছরের ক্লাউড ব্যাকআপ", "অ্যাডভান্সড রিপোর্ট + এক্সপোর্ট", "হোয়াটসঅ্যাপ সাপোর্ট", "প্রেসক্রিপশনে লোগো"],
        cta: "৩০ দিনের ট্রায়াল শুরু করুন",
        popular: true,
      },
      {
        name: "প্রিমিয়াম",
        price: "৳১,০০০",
        period: "/মাস",
        description: "মাল্টি-চেম্বার প্র্যাকটিসের জন্য",
        features: ["আনলিমিটেড রোগী", "আনলিমিটেড SMS", "৫ ব্যবহারকারী (মাল্টি-চেম্বার)", "লাইফটাইম ক্লাউড ব্যাকআপ", "কাস্টম রিপোর্ট", "ফোন + প্রায়োরিটি সাপোর্ট", "সম্পূর্ণ প্রেসক্রিপশন ব্র্যান্ডিং", "একাধিক চেম্বার লোকেশন"],
        cta: "যোগাযোগ করুন",
        popular: false,
      },
    ],
  },
};

const Pricing = () => {
  const { language } = useLanguage();
  const data = pricingText[language];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {data.subtitle}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {data.plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative bg-card rounded-2xl p-8 shadow-lg border transition-all duration-300",
                plan.popular
                  ? "border-primary scale-105 shadow-glow"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    {data.mostPopular}
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
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
