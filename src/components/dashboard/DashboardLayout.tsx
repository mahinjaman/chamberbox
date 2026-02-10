import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Globe, AlertTriangle, Crown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

const EXEMPT_PATHS = ["/dashboard/settings", "/dashboard/payments"];

export const DashboardLayout = ({ children, title, description, actions }: DashboardLayoutProps) => {
  const { isExpired, isLoading: subLoading } = useSubscription();
  const { language } = useLanguage();
  const location = useLocation();
  const bn = language === "bn";

  const isExempt = EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const showBlocker = isExpired && !isExempt && !subLoading;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
            <div className="flex h-14 sm:h-16 items-center gap-3 sm:gap-4">
              <SidebarTrigger className="-ml-2 shrink-0" />
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">{title}</h1>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {!showBlocker && actions}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
            {showBlocker ? (
              <Card className="border-destructive/30 bg-destructive/5 max-w-lg mx-auto mt-12">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {bn ? "সাবস্ক্রিপশন মেয়াদোত্তীর্ণ" : "Subscription Expired"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {bn
                      ? "আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। সকল ফিচার ব্যবহার করতে প্যাকেজ রিনিউ করুন।"
                      : "Your subscription has expired. Please renew your package to continue using all features."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link to="/dashboard/settings">
                        <Crown className="w-4 h-4 mr-2" />
                        {bn ? "প্যাকেজ রিনিউ করুন" : "Renew Package"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard/payments">
                        {bn ? "পেমেন্ট হিস্টোরি" : "Payment History"}
                      </Link>
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => {
                      const message = encodeURIComponent("Hi, I need help with ChamberBox.");
                      window.open(`https://wa.me/8801601025502?text=${message}`, "_blank");
                    }}>
                      <MessageCircle className="w-4 h-4" />
                      {bn ? "সাপোর্টে যোগাযোগ" : "Contact Support"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              children
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
