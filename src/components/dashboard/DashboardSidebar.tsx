import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  CreditCard, 
  Settings,
  LogOut,
  BarChart3,
  ListOrdered,
  Globe,
  Plug,
  Shield,
  MessageSquare,
  UserCog,
  ChevronDown,
  History,
  BookTemplate,
  PlayCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { SupportMenuItem } from "./SupportMenuItem";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CopyBookingLink } from "@/components/common/CopyBookingLink";


export const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useAdmin();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t, language } = useLanguage();
  
  // Controlled state for prescriptions submenu
  const isPrescriptionRoute = location.pathname.includes("/dashboard/prescriptions");
  const [prescriptionMenuOpen, setPrescriptionMenuOpen] = useState(false);
  
  // Open submenu with animation when navigating to prescription routes
  useEffect(() => {
    if (isPrescriptionRoute && !prescriptionMenuOpen) {
      // Small delay to trigger animation after mount
      const timer = setTimeout(() => setPrescriptionMenuOpen(true), 50);
      return () => clearTimeout(timer);
    } else if (!isPrescriptionRoute && prescriptionMenuOpen) {
      setPrescriptionMenuOpen(false);
    }
  }, [isPrescriptionRoute]);

  // Navigation items with translated titles
  const mainNavItems = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.nav.patients, url: "/dashboard/patients", icon: Users },
    { title: t.nav.queue, url: "/dashboard/queue", icon: Clock },
    { title: t.nav.queueStatus, url: "/queue-status", icon: ListOrdered, external: true },
    { title: t.nav.finances, url: "/dashboard/finances", icon: CreditCard },
    { title: t.nav.analytics, url: "/dashboard/analytics", icon: BarChart3 },
  ];

  // Prescription sub-menu items
  const prescriptionSubItems = [
    { 
      title: language === "bn" ? "সাম্প্রতিক প্রেসক্রিপশন" : "Recent Prescriptions", 
      url: "/dashboard/prescriptions", 
      icon: History 
    },
    { 
      title: language === "bn" ? "টেমপ্লেট" : "Templates", 
      url: "/dashboard/prescriptions/templates", 
      icon: BookTemplate 
    },
  ];

  const settingsNavItems = [
    { title: t.nav.myProfile, url: "/dashboard/profile", icon: Globe },
    { title: t.nav.integrations, url: "/dashboard/integrations", icon: Plug },
    { title: t.nav.staffManagement, url: "/dashboard/staff", icon: UserCog },
    { title: language === "bn" ? "টিউটোরিয়াল" : "Tutorials", url: "/dashboard/tutorials", icon: PlayCircle },
    { title: t.nav.settings, url: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-lg">C</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">ChamberBox</span>
          )}
        </Link>
        
        {/* Booking Link Button */}
        {profile?.slug && !collapsed && (
          <div className="mt-3">
            <CopyBookingLink slug={profile.slug} variant="compact" className="w-full" />
          </div>
        )}
        {profile?.slug && collapsed && (
          <div className="mt-3 flex justify-center">
            <CopyBookingLink slug={profile.slug} variant="icon" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Prescriptions with sub-menu */}
              <Collapsible 
                open={prescriptionMenuOpen}
                onOpenChange={setPrescriptionMenuOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    <SidebarMenuButton 
                      asChild
                      tooltip={t.nav.prescriptions}
                      isActive={location.pathname.includes("/dashboard/prescriptions")}
                      className="flex-1"
                    >
                      <Link to="/dashboard/prescriptions">
                        <FileText className="w-5 h-5" />
                        <span>{t.nav.prescriptions}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <button 
                        className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                      {prescriptionSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === subItem.url}
                          >
                            <Link to={subItem.url}>
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SupportMenuItem />
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/tickets")}
                  tooltip={t.nav.myTickets}
                >
                  <Link to="/dashboard/tickets">
                    <MessageSquare className="w-5 h-5" />
                    <span>{t.nav.myTickets}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/admin")}
                    tooltip="Admin Panel"
                  >
                    <Link to="/admin">
                      <Shield className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && profile && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {profile.email}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">{t.nav.logout}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
