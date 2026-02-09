import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/common/LanguageToggle";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export const DashboardLayout = ({ children, title, description, actions }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
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
                <LanguageToggle />
                {actions}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
