import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "For doctors just getting started",
    features: [
      "100 patients/month",
      "20 SMS credits/month",
      "1 user (Doctor only)",
      "7 days cloud backup",
      "Basic reports",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "৳500",
    period: "/month",
    description: "For growing practices",
    features: [
      "Unlimited patients",
      "200 SMS credits/month",
      "2 users (Doctor + Assistant)",
      "1 year cloud backup",
      "Advanced reports + Export",
      "WhatsApp support",
      "Logo on prescriptions",
    ],
    cta: "Start 90-Day Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "৳1,000",
    period: "/month",
    description: "For multi-chamber practices",
    features: [
      "Unlimited patients",
      "Unlimited SMS",
      "5 users (Multi-chamber)",
      "Lifetime cloud backup",
      "Custom reports",
      "Phone + Priority support",
      "Full prescription branding",
      "Multiple chamber locations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with a 90-day free trial. No credit card required. 
            Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
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
                    Most Popular
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

        {/* Payment methods */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-6 uppercase tracking-wider font-medium">
            Accepted Payment Methods
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* bKash */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-[#E2136E]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-[#E2136E]/30 backdrop-blur-sm transition-all duration-300 group-hover:border-[#E2136E]/60 group-hover:shadow-lg group-hover:shadow-[#E2136E]/20 group-hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-[#E2136E] flex items-center justify-center shadow-lg shadow-[#E2136E]/30">
                  <span className="text-white font-bold text-xs">b</span>
                </div>
                <span className="font-semibold text-foreground">bKash</span>
              </div>
            </div>

            {/* Nagad */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-[#F6921E]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-[#F6921E]/30 backdrop-blur-sm transition-all duration-300 group-hover:border-[#F6921E]/60 group-hover:shadow-lg group-hover:shadow-[#F6921E]/20 group-hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-[#F6921E] flex items-center justify-center shadow-lg shadow-[#F6921E]/30">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <span className="font-semibold text-foreground">Nagad</span>
              </div>
            </div>

            {/* Rocket */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-[#8C3494]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-[#8C3494]/30 backdrop-blur-sm transition-all duration-300 group-hover:border-[#8C3494]/60 group-hover:shadow-lg group-hover:shadow-[#8C3494]/20 group-hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-[#8C3494] flex items-center justify-center shadow-lg shadow-[#8C3494]/30">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="font-semibold text-foreground">Rocket</span>
              </div>
            </div>

            {/* Visa */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-[#1A1F71]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-[#1A1F71]/30 backdrop-blur-sm transition-all duration-300 group-hover:border-[#1A1F71]/60 group-hover:shadow-lg group-hover:shadow-[#1A1F71]/20 group-hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#1A1F71] to-[#2557D6] flex items-center justify-center shadow-lg shadow-[#1A1F71]/30">
                  <span className="text-white font-bold text-[10px]">VISA</span>
                </div>
                <span className="font-semibold text-foreground">Visa</span>
              </div>
            </div>

            {/* Mastercard */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-xl bg-[#EB001B]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-[#EB001B]/30 backdrop-blur-sm transition-all duration-300 group-hover:border-[#EB001B]/60 group-hover:shadow-lg group-hover:shadow-[#EB001B]/20 group-hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#EB001B] to-[#F79E1B] flex items-center justify-center shadow-lg shadow-[#EB001B]/30">
                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
                    <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-80" />
                  </div>
                </div>
                <span className="font-semibold text-foreground">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
