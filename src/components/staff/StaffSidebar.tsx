import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Clock, 
  FileText, 
  Users,
  Building2,
  LogOut,
  Home,
  Stethoscope,
  DollarSign,
  UserPlus,
  MessageCircle,
  Settings
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useStaff } from "@/hooks/useStaff";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CopyBookingLink } from "@/components/common/CopyBookingLink";
import chamberboxIcon from "@/assets/chamberbox-icon.png";

export const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { staffInfo, staffPermissions } = useStaff();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { language } = useLanguage();

  const doctor = staffInfo?.doctor as { full_name: string; specialization: string; slug?: string } | null;

  // Build navigation items based on staff permissions
  const navItems = [
    { 
      title: language === "bn" ? "ড্যাশবোর্ড" : "Dashboard", 
      url: "/staff", 
      icon: Home,
      show: true 
    },
    { 
      title: language === "bn" ? "কিউ ম্যানেজ" : "Queue", 
      url: "/staff/queue", 
      icon: Clock,
      show: staffPermissions?.canManageQueue 
    },
    { 
      title: language === "bn" ? "রোগী" : "Patients", 
      url: "/staff/patients", 
      icon: Users,
      show: staffPermissions?.canViewPatientList 
    },
    { 
      title: language === "bn" ? "প্রেসক্রিপশন" : "Prescriptions", 
      url: "/staff/prescriptions", 
      icon: FileText,
      show: staffPermissions?.canViewPrescriptions 
    },
    { 
      title: language === "bn" ? "আর্থিক" : "Finances", 
      url: "/staff/finances", 
      icon: DollarSign,
      show: staffPermissions?.canViewFinances 
    },
    { 
      title: language === "bn" ? "স্টাফ টিম" : "Staff Team", 
      url: "/staff/team", 
      icon: UserPlus,
      show: staffPermissions?.canManageStaff 
    },
    { 
      title: language === "bn" ? "চেম্বার" : "Chambers", 
      url: "/staff/chambers", 
      icon: Building2,
      show: true 
    },
    { 
      title: language === "bn" ? "ইন্টিগ্রেশন" : "Integrations", 
      url: "/staff/integrations", 
      icon: MessageCircle,
      show: staffPermissions?.canManageIntegrations 
    },
    { 
      title: language === "bn" ? "সেটিংস" : "Settings", 
      url: "/staff/settings", 
      icon: Settings,
      show: staffPermissions?.canViewSettings 
    },
  ].filter(item => item.show);

  const isActive = (path: string) => {
    if (path === "/staff") {
      return location.pathname === "/staff";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/staff" className="flex items-center gap-2">
          <img src={chamberboxIcon} alt="ChamberBox" className="w-8 h-8 rounded-lg flex-shrink-0" />
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">ChamberBox</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Doctor Info */}
        {doctor && !collapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {doctor.full_name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {doctor.specialization}
                </p>
              </div>
            </div>
            {doctor.slug && (
              <CopyBookingLink slug={doctor.slug} variant="compact" className="w-full" />
            )}
          </div>
        )}
        {doctor?.slug && collapsed && (
          <div className="px-4 py-2 border-b border-sidebar-border flex justify-center">
            <CopyBookingLink slug={doctor.slug} variant="icon" />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            {language === "bn" ? "মেনু" : "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && staffInfo && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {staffInfo.full_name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {staffInfo.email}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">{language === "bn" ? "লগ আউট" : "Logout"}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
