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

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Register patients in seconds. Search by phone number. View complete visit history at a glance.",
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Create bilingual prescriptions (Bangla/English) with smart medicine search. Print or share digitally.",
  },
  {
    icon: Clock,
    title: "Queue & Token System",
    description: "Auto-generate tokens. SMS notifications to patients. Real-time queue visualization.",
  },
  {
    icon: CreditCard,
    title: "Financial Tracking",
    description: "Track daily earnings, dues, and expenses. Support for cash, bKash, and Nagad payments.",
  },
  {
    icon: MessageSquare,
    title: "SMS Notifications",
    description: "Automated appointment reminders, follow-up alerts, and due payment notifications.",
  },
  {
    icon: BarChart3,
    title: "Practice Analytics",
    description: "Monthly trends, patient retention rates, and revenue insights to grow your practice.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Works beautifully on any smartphone. Large buttons and fonts for easy use.",
  },
  {
    icon: Globe,
    title: "Works Offline",
    description: "No internet? No problem. Core features work offline and sync when connected.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything Your Chamber Needs
          </h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for individual practitioners in Bangladesh. Simple enough for anyone, 
            powerful enough for busy practices.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
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
