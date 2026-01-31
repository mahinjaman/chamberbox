import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Smartphone, Shield, Wifi } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 md:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
            <span className="text-primary text-sm font-medium">🇧🇩 Made for Bangladesh</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Your Digital{" "}
            <span className="text-gradient-primary">Chamber Assistant</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Transform your smartphone into a complete practice management system. 
            Manage patients, prescriptions, queues, and finances — all in under 5 minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6" asChild>
              <Link to="/signup">
                Start 90-Day Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10" asChild>
              <a href="#features">See How It Works</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Mobile-first design</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-info" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-warning" />
              <span>Bank-level security</span>
            </div>
          </div>
        </div>

        {/* Hero image/mockup placeholder */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-card">
            <div className="aspect-video flex items-center justify-center p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Dashboard preview cards */}
                <div className="bg-background rounded-xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-primary mb-2">42</div>
                  <div className="text-muted-foreground text-sm">Patients Today</div>
                </div>
                <div className="bg-background rounded-xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-success mb-2">#7</div>
                  <div className="text-muted-foreground text-sm">Current Token</div>
                </div>
                <div className="bg-background rounded-xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-accent mb-2">৳12,500</div>
                  <div className="text-muted-foreground text-sm">Today's Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
