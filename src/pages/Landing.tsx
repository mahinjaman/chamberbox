import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import PaymentMethods from "@/components/landing/PaymentMethods";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <PaymentMethods />
      <Footer />
    </div>
  );
};

export default Landing;
