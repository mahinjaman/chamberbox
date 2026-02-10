import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import chamberboxIcon from "@/assets/chamberbox-icon.png";
import Footer from "@/components/landing/Footer";

const privacyText = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: February 2026",
    backToHome: "Back to Home",
    sections: [
      {
        title: "1. Introduction",
        content:
          "ChamberBox (\"we\", \"our\", or \"us\") is committed to protecting the privacy of doctors, staff, and patients who use our digital chamber management platform. This Privacy Policy explains how we collect, use, store, and protect your personal information.",
      },
      {
        title: "2. Information We Collect",
        content:
          "We collect the following types of information:\n\n• **Account Information**: Name, email address, phone number, BMDC registration number, and professional details when you sign up.\n• **Patient Data**: Patient names, phone numbers, age, gender, medical history, prescriptions, and visit records entered by doctors or staff.\n• **Usage Data**: Log data, device information, and analytics about how you interact with ChamberBox.\n• **Payment Information**: Transaction IDs, mobile payment numbers, and subscription payment records.\n• **Contact Form Data**: Name, email, phone, and message content submitted through our contact form.",
      },
      {
        title: "3. How We Use Your Information",
        content:
          "We use your information to:\n\n• Provide and maintain the ChamberBox platform services\n• Manage patient queues, appointments, and prescriptions\n• Process subscription payments and manage billing\n• Send important notifications about your account and services\n• Improve our platform and develop new features\n• Provide customer support\n• Comply with legal obligations",
      },
      {
        title: "4. Data Storage & Security",
        content:
          "All data is stored securely using industry-standard encryption. We use Row Level Security (RLS) to ensure that each doctor can only access their own patients' data. Patient information is never shared between different doctors' accounts. We implement regular security audits and follow best practices for data protection.",
      },
      {
        title: "5. Data Sharing",
        content:
          "We do not sell, rent, or share your personal data or patient information with third parties, except:\n\n• When required by law or legal process\n• With your explicit consent\n• With service providers who help us operate our platform (under strict confidentiality agreements)\n• When a doctor's public profile is enabled, only professional information (name, specialization, degrees, chamber details) is made publicly visible — never patient data.",
      },
      {
        title: "6. Patient Data Protection",
        content:
          "Patient data entered into ChamberBox is treated with the highest level of confidentiality:\n\n• Only the registered doctor and their authorized staff can access patient records\n• Patient data is never used for marketing or advertising purposes\n• Patients can request their data through their treating doctor\n• We comply with applicable healthcare data protection regulations in Bangladesh",
      },
      {
        title: "7. Your Rights",
        content:
          "You have the right to:\n\n• Access your personal data stored on our platform\n• Request correction of inaccurate information\n• Request deletion of your account and associated data\n• Export your data in a portable format\n• Withdraw consent for optional data processing\n• Lodge a complaint regarding data handling",
      },
      {
        title: "8. Cookies & Analytics",
        content:
          "We use essential cookies to maintain your session and preferences (such as language selection). We may use analytics tools to understand platform usage patterns. No third-party advertising cookies are used.",
      },
      {
        title: "9. Data Retention",
        content:
          "We retain your data for as long as your account is active. If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law. Patient records may be retained as per medical record-keeping regulations.",
      },
      {
        title: "10. Changes to This Policy",
        content:
          "We may update this Privacy Policy from time to time. We will notify you of any significant changes through the platform or via email. Continued use of ChamberBox after changes constitutes acceptance of the updated policy.",
      },
      {
        title: "11. Contact Us",
        content:
          "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through our website's contact form or reach out to our support team.",
      },
    ],
  },
  bn: {
    title: "প্রাইভেসি পলিসি",
    lastUpdated: "সর্বশেষ আপডেট: ফেব্রুয়ারি ২০২৬",
    backToHome: "হোমে ফিরে যান",
    sections: [
      {
        title: "১. ভূমিকা",
        content:
          "ChamberBox (\"আমরা\") আমাদের ডিজিটাল চেম্বার ম্যানেজমেন্ট প্ল্যাটফর্ম ব্যবহারকারী ডাক্তার, স্টাফ এবং রোগীদের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই প্রাইভেসি পলিসি ব্যাখ্যা করে কিভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষা করি।",
      },
      {
        title: "২. আমরা যে তথ্য সংগ্রহ করি",
        content:
          "আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করি:\n\n• **অ্যাকাউন্ট তথ্য**: সাইন আপ করার সময় নাম, ইমেইল, ফোন নম্বর, BMDC নম্বর এবং পেশাদার বিবরণ।\n• **রোগীর তথ্য**: ডাক্তার বা স্টাফ দ্বারা প্রবেশ করানো রোগীর নাম, ফোন, বয়স, লিঙ্গ, চিকিৎসা ইতিহাস এবং প্রেসক্রিপশন।\n• **ব্যবহার তথ্য**: লগ ডেটা, ডিভাইস তথ্য এবং প্ল্যাটফর্ম ব্যবহারের বিশ্লেষণ।\n• **পেমেন্ট তথ্য**: লেনদেন আইডি, মোবাইল পেমেন্ট নম্বর এবং সাবস্ক্রিপশন রেকর্ড।\n• **যোগাযোগ ফর্ম**: কন্ট্যাক্ট ফর্মের মাধ্যমে পাঠানো নাম, ইমেইল, ফোন এবং বার্তা।",
      },
      {
        title: "৩. তথ্য ব্যবহারের উদ্দেশ্য",
        content:
          "আমরা আপনার তথ্য ব্যবহার করি:\n\n• ChamberBox প্ল্যাটফর্ম পরিষেবা প্রদান ও রক্ষণাবেক্ষণ\n• রোগীর কিউ, অ্যাপয়েন্টমেন্ট এবং প্রেসক্রিপশন পরিচালনা\n• সাবস্ক্রিপশন পেমেন্ট প্রক্রিয়াকরণ\n• গুরুত্বপূর্ণ নোটিফিকেশন পাঠানো\n• প্ল্যাটফর্ম উন্নতি ও নতুন ফিচার তৈরি\n• কাস্টমার সাপোর্ট প্রদান",
      },
      {
        title: "৪. তথ্য সংরক্ষণ ও নিরাপত্তা",
        content:
          "সমস্ত তথ্য শিল্প-মানের এনক্রিপশন ব্যবহার করে নিরাপদে সংরক্ষণ করা হয়। আমরা Row Level Security (RLS) ব্যবহার করি যাতে প্রতিটি ডাক্তার শুধুমাত্র তাদের নিজের রোগীদের তথ্য অ্যাক্সেস করতে পারেন। রোগীর তথ্য কখনই বিভিন্ন ডাক্তারের অ্যাকাউন্টের মধ্যে শেয়ার করা হয় না।",
      },
      {
        title: "৫. তথ্য শেয়ারিং",
        content:
          "আমরা আপনার ব্যক্তিগত তথ্য বা রোগীর তথ্য তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা শেয়ার করি না, ব্যতীত:\n\n• আইন বা আইনি প্রক্রিয়া দ্বারা প্রয়োজন হলে\n• আপনার স্পষ্ট সম্মতিতে\n• আমাদের প্ল্যাটফর্ম পরিচালনায় সহায়তাকারী পরিষেবা প্রদানকারীদের সাথে\n• ডাক্তারের পাবলিক প্রোফাইল সক্রিয় থাকলে শুধুমাত্র পেশাদার তথ্য দৃশ্যমান হয় — রোগীর তথ্য কখনই নয়।",
      },
      {
        title: "৬. রোগীর তথ্য সুরক্ষা",
        content:
          "ChamberBox-এ প্রবেশ করানো রোগীর তথ্য সর্বোচ্চ গোপনীয়তায় রাখা হয়:\n\n• শুধুমাত্র নিবন্ধিত ডাক্তার এবং তাদের অনুমোদিত স্টাফ রোগীর রেকর্ড অ্যাক্সেস করতে পারেন\n• রোগীর তথ্য কখনই মার্কেটিং বা বিজ্ঞাপনের জন্য ব্যবহার করা হয় না\n• বাংলাদেশের প্রযোজ্য স্বাস্থ্য তথ্য সুরক্ষা বিধি মেনে চলা হয়",
      },
      {
        title: "৭. আপনার অধিকার",
        content:
          "আপনার অধিকার রয়েছে:\n\n• আপনার সংরক্ষিত ব্যক্তিগত তথ্য অ্যাক্সেস করা\n• ভুল তথ্য সংশোধনের অনুরোধ\n• আপনার অ্যাকাউন্ট এবং সংশ্লিষ্ট তথ্য মুছে ফেলার অনুরোধ\n• আপনার তথ্য রপ্তানি করা\n• ঐচ্ছিক তথ্য প্রক্রিয়াকরণের জন্য সম্মতি প্রত্যাহার",
      },
      {
        title: "৮. কুকিজ ও অ্যানালিটিক্স",
        content:
          "আমরা আপনার সেশন এবং পছন্দ (যেমন ভাষা নির্বাচন) বজায় রাখতে প্রয়োজনীয় কুকিজ ব্যবহার করি। কোনো তৃতীয় পক্ষের বিজ্ঞাপন কুকিজ ব্যবহার করা হয় না।",
      },
      {
        title: "৯. তথ্য ধারণ",
        content:
          "আপনার অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত আমরা আপনার তথ্য সংরক্ষণ করি। অ্যাকাউন্ট মুছে ফেললে ৩০ দিনের মধ্যে তথ্য স্থায়ীভাবে মুছে ফেলা হবে, আইন দ্বারা প্রয়োজনীয় ক্ষেত্রে ব্যতীত।",
      },
      {
        title: "১০. পলিসি পরিবর্তন",
        content:
          "আমরা সময়ে সময়ে এই প্রাইভেসি পলিসি আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের বিষয়ে প্ল্যাটফর্ম বা ইমেইলের মাধ্যমে জানানো হবে।",
      },
      {
        title: "১১. যোগাযোগ",
        content:
          "এই প্রাইভেসি পলিসি বা আমাদের তথ্য অনুশীলন সম্পর্কে কোনো প্রশ্ন থাকলে, আমাদের ওয়েবসাইটের কন্ট্যাক্ট ফর্মের মাধ্যমে যোগাযোগ করুন।",
      },
    ],
  },
};

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const t = privacyText[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={chamberboxIcon} alt="ChamberBox" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-lg text-foreground">ChamberBox</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.backToHome}
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              {language === "bn" ? "গোপনীয়তা" : "Privacy"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-sm">{t.lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {t.sections.map((section, i) => (
            <section key={i} className="prose prose-sm max-w-none">
              <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                {section.content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-foreground font-medium">
                      {part}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
