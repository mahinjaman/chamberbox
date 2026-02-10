import { ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const paymentText = {
  en: {
    badge: "Secure & Trusted",
    title: "Flexible Payment Options",
    subtitle: "Pay with your preferred method. All transactions are secured with bank-level encryption. Start free, upgrade when you're ready.",
    ssl: "256-bit SSL Encryption",
    pci: "PCI DSS Compliant",
  },
  bn: {
    badge: "নিরাপদ ও বিশ্বস্ত",
    title: "নমনীয় পেমেন্ট অপশন",
    subtitle: "আপনার পছন্দের পদ্ধতিতে পেমেন্ট করুন। সকল লেনদেন ব্যাংক-লেভেল এনক্রিপশনে সুরক্ষিত। ফ্রি শুরু করুন, প্রস্তুত হলে আপগ্রেড করুন।",
    ssl: "২৫৬-বিট SSL এনক্রিপশন",
    pci: "PCI DSS সম্মত",
  },
};

const PaymentMethods = () => {
  const { language } = useLanguage();
  const t = paymentText[language];

  return (
    <section className="py-20 md:py-24 bg-background/80 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-success text-sm font-medium">{t.badge}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Payment methods grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
          {/* bKash */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#E2136E]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-[#E2136E]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-[#E2136E]/50 group-hover:shadow-xl group-hover:shadow-[#E2136E]/10 group-hover:scale-105">
              <div className="w-10 h-10 rounded-xl bg-[#E2136E] flex items-center justify-center shadow-lg shadow-[#E2136E]/30">
                <span className="text-white font-bold text-sm">b</span>
              </div>
              <span className="font-semibold text-foreground text-lg">bKash</span>
            </div>
          </div>

          {/* Nagad */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#F6921E]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-[#F6921E]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-[#F6921E]/50 group-hover:shadow-xl group-hover:shadow-[#F6921E]/10 group-hover:scale-105">
              <div className="w-10 h-10 rounded-xl bg-[#F6921E] flex items-center justify-center shadow-lg shadow-[#F6921E]/30">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-foreground text-lg">Nagad</span>
            </div>
          </div>

          {/* Rocket */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#8C3494]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-[#8C3494]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-[#8C3494]/50 group-hover:shadow-xl group-hover:shadow-[#8C3494]/10 group-hover:scale-105">
              <div className="w-10 h-10 rounded-xl bg-[#8C3494] flex items-center justify-center shadow-lg shadow-[#8C3494]/30">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-foreground text-lg">Rocket</span>
            </div>
          </div>

          {/* Visa */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#1A1F71]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-[#1A1F71]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-[#1A1F71]/50 group-hover:shadow-xl group-hover:shadow-[#1A1F71]/10 group-hover:scale-105">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1A1F71] to-[#2557D6] flex items-center justify-center shadow-lg shadow-[#1A1F71]/30">
                <span className="text-white font-bold text-[10px]">VISA</span>
              </div>
              <span className="font-semibold text-foreground text-lg">Visa</span>
            </div>
          </div>

          {/* Mastercard */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-[#EB001B]/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-[#EB001B]/20 backdrop-blur-sm transition-all duration-300 group-hover:border-[#EB001B]/50 group-hover:shadow-xl group-hover:shadow-[#EB001B]/10 group-hover:scale-105">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#EB001B] to-[#F79E1B] flex items-center justify-center shadow-lg shadow-[#EB001B]/30">
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-80" />
                </div>
              </div>
              <span className="font-semibold text-foreground text-lg">Mastercard</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">{t.ssl}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">{t.pci}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethods;
