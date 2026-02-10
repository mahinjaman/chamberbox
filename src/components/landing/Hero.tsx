import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Smartphone, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const heroText = {
  en: {
    badge: "🇧🇩 Made for Bangladesh",
    title1: "Your Digital",
    titleHighlight: "Chamber Assistant",
    subtitle: "Transform your smartphone into a complete practice management system. Manage patients, prescriptions, queues, and finances — all in under 5 minutes.",
    cta: "Start 30-Day Free Trial",
    ctaSecondary: "See How It Works",
    noCreditCard: "No credit card required",
    mobileFirst: "Mobile-first design",
    security: "Bank-level security",
    patientsServed: "Patients Served",
    doctorsOnboarded: "Doctors Onboarded",
    tokensGenerated: "Tokens Generated",
    hoursSaved: "Hours Saved",
  },
  bn: {
    badge: "🇧🇩 বাংলাদেশের জন্য তৈরি",
    title1: "আপনার ডিজিটাল",
    titleHighlight: "চেম্বার সহকারী",
    subtitle: "আপনার স্মার্টফোনকে সম্পূর্ণ চেম্বার ম্যানেজমেন্ট সিস্টেমে রূপান্তর করুন। রোগী, প্রেসক্রিপশন, কিউ এবং আর্থিক হিসাব — সব ৫ মিনিটের মধ্যে।",
    cta: "৩০ দিনের ফ্রি ট্রায়াল শুরু করুন",
    ctaSecondary: "কিভাবে কাজ করে দেখুন",
    noCreditCard: "ক্রেডিট কার্ড লাগবে না",
    mobileFirst: "মোবাইল-ফার্স্ট ডিজাইন",
    security: "ব্যাংক-লেভেল সিকিউরিটি",
    patientsServed: "রোগী সেবা দেওয়া হয়েছে",
    doctorsOnboarded: "ডাক্তার যুক্ত হয়েছেন",
    tokensGenerated: "টোকেন তৈরি হয়েছে",
    hoursSaved: "ঘণ্টা সাশ্রয় হয়েছে",
  },
};

export const Hero = () => {
  const { language } = useLanguage();
  const t = heroText[language];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 md:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
            <span className="text-primary text-sm font-medium">{t.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {t.title1}{" "}
            <span className="text-gradient-primary">{t.titleHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {t.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6" asChild>
              <Link to="/signup">
                {t.cta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10" asChild>
              <a href="#features">{t.ctaSecondary}</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>{t.noCreditCard}</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>{t.mobileFirst}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-warning" />
              <span>{t.security}</span>
            </div>
          </div>
        </div>

        {/* Platform Stats - temporarily hidden */}
        {/* <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          ...stats cards...
        </div> */}
      </div>
    </section>
  );
};
