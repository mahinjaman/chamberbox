import { Link } from "react-router-dom";
import { Facebook } from "lucide-react";
import chamberboxIcon from "@/assets/chamberbox-icon.png";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const footerText = {
  en: {
    description: "The complete digital chamber management system for individual doctors in Bangladesh. Simple, affordable, and built for local needs.",
    madeWith: "Made with ❤️ in Bangladesh",
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    signIn: "Sign In",
    support: "Support",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    copyright: `© ${new Date().getFullYear()} ChamberBox. All rights reserved.`,
  },
  bn: {
    description: "বাংলাদেশের ডাক্তারদের জন্য সম্পূর্ণ ডিজিটাল চেম্বার ম্যানেজমেন্ট সিস্টেম। সহজ, সাশ্রয়ী এবং স্থানীয় প্রয়োজনে তৈরি।",
    madeWith: "বাংলাদেশে ❤️ দিয়ে তৈরি",
    product: "প্রোডাক্ট",
    features: "ফিচার",
    pricing: "মূল্য",
    signIn: "সাইন ইন",
    support: "সাপোর্ট",
    helpCenter: "হেল্প সেন্টার",
    contactUs: "যোগাযোগ করুন",
    privacyPolicy: "প্রাইভেসি পলিসি",
    copyright: `© ${new Date().getFullYear()} ChamberBox। সর্বস্বত্ব সংরক্ষিত।`,
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const t = footerText[language];

  return (
    <footer id="about" className="bg-sidebar py-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={chamberboxIcon} alt="ChamberBox" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-xl text-sidebar-foreground">ChamberBox</span>
            </Link>
            <p className="text-sidebar-foreground/70 max-w-md mb-6">
              {t.description}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/chamberboxbd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sidebar-foreground/50 text-sm mt-4">
              {t.madeWith}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sidebar-foreground font-semibold mb-4">{t.product}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/#features" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.features}
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.pricing}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.signIn}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sidebar-foreground font-semibold mb-4">{t.support}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.helpCenter}
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  {t.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-sidebar-border">
          <p className="text-center text-sidebar-foreground/50 text-sm">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
