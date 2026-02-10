import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import PaymentMethods from "@/components/landing/PaymentMethods";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
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
