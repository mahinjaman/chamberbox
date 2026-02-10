import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "ডা. মোহাম্মদ রফিকুল ইসলাম",
    specialization: "মেডিসিন বিশেষজ্ঞ",
    location: "ঢাকা",
    avatar: "",
    initials: "রই",
    rating: 5,
    quote:
      "ChamberBox ব্যবহার করার পর থেকে আমার চেম্বারের কাজ অনেক সহজ হয়ে গেছে। আগে প্রেসক্রিপশন লিখতে যে সময় লাগতো, এখন তার অর্ধেক সময়ে হয়ে যায়। রোগীরাও খুশি কারণ টোকেন সিস্টেমে তাদের অপেক্ষা কমেছে।",
  },
  {
    name: "ডা. ফারহানা আক্তার",
    specialization: "গাইনি বিশেষজ্ঞ",
    location: "চট্টগ্রাম",
    avatar: "",
    initials: "ফআ",
    rating: 5,
    quote:
      "বিকাশ আর নগদে পেমেন্ট ট্র্যাক করা এখন অনেক সহজ। আগে হিসাব মেলাতে ঘণ্টা লাগতো, এখন ChamberBox-এ সব অটোমেটিক। আমার স্টাফও সহজে ব্যবহার করতে পারছে।",
  },
  {
    name: "ডা. আবদুল করিম",
    specialization: "শিশু রোগ বিশেষজ্ঞ",
    location: "রাজশাহী",
    avatar: "",
    initials: "আক",
    rating: 5,
    quote:
      "মফস্বলে ইন্টারনেট সমস্যা থাকলেও ChamberBox ভালো কাজ করে। মোবাইল দিয়েই সব ম্যানেজ করতে পারি। SMS নোটিফিকেশনে রোগীরা সময়মতো আসে, ফলো-আপও মিস হয় না।",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">ডাক্তারদের মতামত</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            ডাক্তাররা যা বলছেন
          </h2>
          <p className="text-lg text-muted-foreground">
            সারাদেশের ডাক্তাররা ChamberBox ব্যবহার করে তাদের চেম্বার পরিচালনা সহজ করছেন
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative bg-card rounded-2xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Avatar className="w-10 h-10">
                  {testimonial.avatar && <AvatarImage src={testimonial.avatar} />}
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
      </div>
    </section>
  );
};

export default Testimonials;
