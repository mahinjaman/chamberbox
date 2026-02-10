import { 
  Users, 
  FileText, 
  Clock, 
  CreditCard, 
  MessageSquare, 
  BarChart3,
  Smartphone,
  Globe
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const featuresData = {
  en: {
    title: "Everything Your Chamber Needs",
    subtitle: "Built specifically for individual practitioners in Bangladesh. Simple enough for anyone, powerful enough for busy practices.",
    items: [
      { icon: Users, title: "Patient Management", description: "Register patients in seconds. Search by phone number. View complete visit history at a glance." },
      { icon: FileText, title: "Digital Prescriptions", description: "Create bilingual prescriptions (Bangla/English) with smart medicine search. Print or share digitally." },
      { icon: Clock, title: "Queue & Token System", description: "Auto-generate tokens. SMS notifications to patients. Real-time queue visualization." },
      { icon: CreditCard, title: "Financial Tracking", description: "Track daily earnings, dues, and expenses. Support for cash, bKash, and Nagad payments." },
      { icon: MessageSquare, title: "SMS Notifications", description: "Automated appointment reminders, follow-up alerts, and due payment notifications." },
      { icon: BarChart3, title: "Practice Analytics", description: "Monthly trends, patient retention rates, and revenue insights to grow your practice." },
      { icon: Smartphone, title: "Mobile-First Design", description: "Works beautifully on any smartphone. Large buttons and fonts for easy use." },
      { icon: Globe, title: "Works Offline", description: "No internet? No problem. Core features work offline and sync when connected." },
    ],
  },
  bn: {
    title: "আপনার চেম্বারের জন্য সবকিছু",
    subtitle: "বাংলাদেশের ডাক্তারদের জন্য বিশেষভাবে তৈরি। যেকোনো ব্যক্তির জন্য যথেষ্ট সহজ, ব্যস্ত প্র্যাকটিসের জন্য যথেষ্ট শক্তিশালী।",
    items: [
      { icon: Users, title: "রোগী ব্যবস্থাপনা", description: "সেকেন্ডেই রোগী রেজিস্টার করুন। ফোন নম্বর দিয়ে সার্চ করুন। সম্পূর্ণ ভিজিট হিস্টোরি এক নজরে দেখুন।" },
      { icon: FileText, title: "ডিজিটাল প্রেসক্রিপশন", description: "দ্বিভাষিক প্রেসক্রিপশন (বাংলা/ইংরেজি) স্মার্ট ওষুধ সার্চ দিয়ে তৈরি করুন। প্রিন্ট বা ডিজিটালি শেয়ার করুন।" },
      { icon: Clock, title: "কিউ ও টোকেন সিস্টেম", description: "অটো-টোকেন জেনারেট করুন। রোগীদের SMS নোটিফিকেশন। রিয়েল-টাইম কিউ ভিজুয়ালাইজেশন।" },
      { icon: CreditCard, title: "আর্থিক হিসাব", description: "দৈনিক আয়, বকেয়া এবং খরচ ট্র্যাক করুন। ক্যাশ, বিকাশ এবং নগদ পেমেন্ট সাপোর্ট।" },
      { icon: MessageSquare, title: "SMS নোটিফিকেশন", description: "স্বয়ংক্রিয় অ্যাপয়েন্টমেন্ট রিমাইন্ডার, ফলো-আপ অ্যালার্ট এবং বকেয়া পেমেন্ট নোটিফিকেশন।" },
      { icon: BarChart3, title: "প্র্যাকটিস অ্যানালিটিক্স", description: "মাসিক ট্রেন্ড, রোগী ধরে রাখার হার এবং আয়ের ইনসাইট আপনার প্র্যাকটিস বাড়াতে।" },
      { icon: Smartphone, title: "মোবাইল-ফার্স্ট ডিজাইন", description: "যেকোনো স্মার্টফোনে সুন্দরভাবে কাজ করে। সহজ ব্যবহারের জন্য বড় বাটন এবং ফন্ট।" },
      { icon: Globe, title: "অফলাইনে কাজ করে", description: "ইন্টারনেট নেই? সমস্যা নেই। মূল ফিচারগুলো অফলাইনে কাজ করে এবং কানেক্ট হলে সিঙ্ক হয়।" },
    ],
  },
};

export const Features = () => {
  const { language } = useLanguage();
  const data = featuresData[language];

  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
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

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-sm border border-border/50 card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
