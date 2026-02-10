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
  PlayCircle,
  Receipt
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
import { Headset } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CopyBookingLink } from "@/components/common/CopyBookingLink";
import chamberboxIcon from "@/assets/chamberbox-icon.png";


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
  
  // Controlled state for settings submenu
  const settingsSubPaths = ["/dashboard/settings", "/dashboard/integrations", "/dashboard/staff", "/dashboard/payments"];
  const isSettingsRoute = settingsSubPaths.some(p => location.pathname.startsWith(p));
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  // Controlled state for support submenu
  const supportSubPaths = ["/dashboard/tutorials", "/dashboard/tickets"];
  const isSupportRoute = supportSubPaths.some(p => location.pathname.startsWith(p));
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  
  useEffect(() => {
    if (isPrescriptionRoute && !prescriptionMenuOpen) {
      const timer = setTimeout(() => setPrescriptionMenuOpen(true), 50);
      return () => clearTimeout(timer);
    } else if (!isPrescriptionRoute && prescriptionMenuOpen) {
      setPrescriptionMenuOpen(false);
    }
  }, [isPrescriptionRoute]);

  useEffect(() => {
    if (isSettingsRoute && !settingsMenuOpen) {
      const timer = setTimeout(() => setSettingsMenuOpen(true), 50);
      return () => clearTimeout(timer);
    } else if (!isSettingsRoute && settingsMenuOpen) {
      setSettingsMenuOpen(false);
    }
  }, [isSettingsRoute]);

  useEffect(() => {
    if (isSupportRoute && !supportMenuOpen) {
      const timer = setTimeout(() => setSupportMenuOpen(true), 50);
      return () => clearTimeout(timer);
    } else if (!isSupportRoute && supportMenuOpen) {
      setSupportMenuOpen(false);
    }
  }, [isSupportRoute]);

  const mainNavItems = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.nav.patients, url: "/dashboard/patients", icon: Users },
    { title: t.nav.queue, url: "/dashboard/queue", icon: Clock },
    { title: t.nav.queueStatus, url: "/dashboard/queue-status", icon: ListOrdered },
    { title: t.nav.finances, url: "/dashboard/finances", icon: CreditCard },
    { title: t.nav.analytics, url: "/dashboard/analytics", icon: BarChart3 },
  ];

  const prescriptionSubItems = [
    { title: language === "bn" ? "সাম্প্রতিক প্রেসক্রিপশন" : "Recent Prescriptions", url: "/dashboard/prescriptions", icon: History },
    { title: language === "bn" ? "টেমপ্লেট" : "Templates", url: "/dashboard/prescriptions/templates", icon: BookTemplate },
  ];

  const settingsSubItems = [
    { title: language === "bn" ? "সাবস্ক্রিপশন ও প্রোফাইল" : "Subscription & Profile", url: "/dashboard/settings", icon: Shield },
    { title: language === "bn" ? "পেমেন্ট হিস্ট্রি" : "Payment History", url: "/dashboard/payments", icon: Receipt },
    { title: t.nav.integrations, url: "/dashboard/integrations", icon: Plug },
    { title: t.nav.staffManagement, url: "/dashboard/staff", icon: UserCog },
  ];

  const supportSubItems = [
    { title: language === "bn" ? "টিউটোরিয়াল" : "Tutorials", url: "/dashboard/tutorials", icon: PlayCircle },
    { title: t.nav.myTickets, url: "/dashboard/tickets", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={chamberboxIcon} alt="ChamberBox" className="w-8 h-8 rounded-lg flex-shrink-0" />
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">ChamberBox</span>
          )}
        </Link>
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
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Prescriptions with sub-menu */}
              <Collapsible open={prescriptionMenuOpen} onOpenChange={setPrescriptionMenuOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    <SidebarMenuButton asChild tooltip={t.nav.prescriptions} isActive={isPrescriptionRoute} className="flex-1">
                      <Link to="/dashboard/prescriptions">
                        <FileText className="w-5 h-5" />
                        <span>{t.nav.prescriptions}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <button className="p-2 hover:bg-sidebar-accent rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                      {prescriptionSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
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
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* My Profile */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")} tooltip={t.nav.myProfile}>
                  <Link to="/dashboard/profile">
                    <Globe className="w-5 h-5" />
                    <span>{t.nav.myProfile}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings with sub-menu */}
              <Collapsible open={settingsMenuOpen} onOpenChange={setSettingsMenuOpen} className="group/settings">
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    <SidebarMenuButton 
                      tooltip={t.nav.settings} 
                      isActive={isSettingsRoute} 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>{t.nav.settings}</span>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <button className="p-2 hover:bg-sidebar-accent rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/settings:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                      {settingsSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={location.pathname.startsWith(subItem.url)}>
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

              {/* Support with sub-menu */}
              <Collapsible open={supportMenuOpen} onOpenChange={setSupportMenuOpen} className="group/support">
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    <SidebarMenuButton 
                      tooltip={language === "bn" ? "সাপোর্ট" : "Support"} 
                      isActive={isSupportRoute} 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSupportMenuOpen(!supportMenuOpen)}
                    >
                      <Headset className="w-5 h-5" />
                      <span>{language === "bn" ? "সাপোর্ট" : "Support"}</span>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <button className="p-2 hover:bg-sidebar-accent rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/support:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                      {supportSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton asChild isActive={location.pathname.startsWith(subItem.url)}>
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

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && profile?.doctor_code && (
          <div className="mb-2 px-2 py-1.5 bg-sidebar-accent/50 rounded-md text-center">
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Doctor ID</p>
            <p className="text-sm font-mono font-bold text-sidebar-foreground tracking-widest">{profile.doctor_code}</p>
          </div>
        )}
        {!collapsed && profile && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.full_name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile.email}</p>
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
