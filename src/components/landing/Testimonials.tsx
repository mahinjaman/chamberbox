import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const testimonials = {
  en: [
    {
      name: "Dr. Mohammad Rafiqul Islam",
      specialization: "Medicine Specialist",
      location: "Dhaka",
      initials: "RI",
      rating: 5,
      quote:
        "Since using ChamberBox, my chamber work has become so much easier. Prescriptions that used to take a long time now get done in half the time. Patients are also happy because the token system has reduced their waiting time.",
    },
    {
      name: "Dr. Farhana Akter",
      specialization: "Gynecology Specialist",
      location: "Chittagong",
      initials: "FA",
      rating: 5,
      quote:
        "Tracking payments through bKash and Nagad is so easy now. Before, it took hours to reconcile accounts, now everything is automatic in ChamberBox. My staff can also use it easily.",
    },
    {
      name: "Dr. Abdul Karim",
      specialization: "Pediatrician",
      location: "Rajshahi",
      initials: "AK",
      rating: 5,
      quote:
        "Even with internet issues in rural areas, ChamberBox works well. I can manage everything from my mobile. The public profile and online booking system lets patients book serials easily without any hassle.",
    },
  ],
  bn: [
    {
      name: "ডা. মোহাম্মদ রফিকুল ইসলাম",
      specialization: "মেডিসিন বিশেষজ্ঞ",
      location: "ঢাকা",
      initials: "রই",
      rating: 5,
      quote:
        "ChamberBox ব্যবহার করার পর থেকে আমার চেম্বারের কাজ অনেক সহজ হয়ে গেছে। আগে প্রেসক্রিপশন লিখতে যে সময় লাগতো, এখন তার অর্ধেক সময়ে হয়ে যায়। রোগীরাও খুশি কারণ টোকেন সিস্টেমে তাদের অপেক্ষা কমেছে।",
    },
    {
      name: "ডা. ফারহানা আক্তার",
      specialization: "গাইনি বিশেষজ্ঞ",
      location: "চট্টগ্রাম",
      initials: "ফআ",
      rating: 5,
      quote:
        "বিকাশ আর নগদে পেমেন্ট ট্র্যাক করা এখন অনেক সহজ। আগে হিসাব মেলাতে ঘণ্টা লাগতো, এখন ChamberBox-এ সব অটোমেটিক। আমার স্টাফও সহজে ব্যবহার করতে পারছে।",
    },
    {
      name: "ডা. আবদুল করিম",
      specialization: "শিশু রোগ বিশেষজ্ঞ",
      location: "রাজশাহী",
      initials: "আক",
      rating: 5,
      quote:
        "মফস্বলে ইন্টারনেট সমস্যা থাকলেও ChamberBox ভালো কাজ করে। মোবাইল দিয়েই সব ম্যানেজ করতে পারি। পাবলিক প্রোফাইল আর অনলাইন বুকিং সিস্টেমে রোগীরা সহজেই সিরিয়াল নিতে পারে, কোনো ঝামেলা ছাড়াই।",
    },
  ],
};

const sectionText = {
  en: {
    badge: "What Doctors Are Saying",
    title: "Trusted by Doctors",
    subtitle: "Doctors across Bangladesh are simplifying their chamber management with ChamberBox",
    disclaimer: "These are demo reviews based on features. New reviews are coming soon.",
  },
  bn: {
    badge: "ডাক্তারদের মতামত",
    title: "ডাক্তাররা যা বলছেন",
    subtitle: "সারাদেশের ডাক্তাররা ChamberBox ব্যবহার করে তাদের চেম্বার পরিচালনা সহজ করছেন",
    disclaimer: "এগুলো ফিচারের উপর ভিত্তি করে ডেমো রিভিউ। নতুন রিভিউ আসছে শীঘ্রই।",
  },
};

const Testimonials = () => {
  const { language } = useLanguage();
  const items = testimonials[language];
  const text = sectionText[language];

  return (
    <section className="py-20 md:py-32 bg-background/80">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">{text.badge}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {text.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {text.subtitle}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group relative bg-card rounded-2xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.specialization} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          {text.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
