import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import PaymentMethods from "@/components/landing/PaymentMethods";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <PaymentMethods />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Landing;
