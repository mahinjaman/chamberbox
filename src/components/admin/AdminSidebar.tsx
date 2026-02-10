import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Video,
  LogOut,
  Settings,
  CheckCircle,
  UserCog,
  Mail,
  Phone,
  BarChart3,
  Pill,
  Inbox
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
import { AdminStaffPermissions } from "@/hooks/useAdminStaff";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import chamberboxIcon from "@/assets/chamberbox-icon.png";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const getNavGroups = (permissions: AdminStaffPermissions | null): NavGroup[] => {
  if (!permissions) return [{ label: "Overview", items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }] }];

  const groups: NavGroup[] = [];

  // Doctors & Billing (includes Dashboard)
  const doctorItems: NavItem[] = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  ];
  if (permissions.canManageDoctors) {
    doctorItems.push({ title: "Doctors", url: "/admin/doctors", icon: Users });
  }
  if (permissions.canManageSubscriptions) {
    doctorItems.push({ title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard });
  }
  if (permissions.canVerifyPayments) {
    doctorItems.push({ title: "Payments", url: "/admin/payments", icon: CheckCircle });
  }
  groups.push({ label: "Doctors & Billing", items: doctorItems });

  // Platform Config
  const configItems: NavItem[] = [];
  if (permissions.canConfigurePlans) {
    configItems.push({ title: "Plan Config", url: "/admin/plans", icon: Settings });
  }
  configItems.push({ title: "SMS Config", url: "/admin/sms", icon: Phone });
  configItems.push({ title: "Medicines", url: "/admin/medicines", icon: Pill });
  groups.push({ label: "Configuration", items: configItems });

  // Analytics
  groups.push({
    label: "Insights",
    items: [{ title: "Analytics", url: "/admin/analytics", icon: BarChart3 }],
  });

  // Support & Content
  const supportItems: NavItem[] = [];
  if (permissions.canManageTickets) {
    supportItems.push({ title: "Support Tickets", url: "/admin/tickets", icon: MessageSquare });
    supportItems.push({ title: "Contact Messages", url: "/admin/contacts", icon: Inbox });
  }
  if (permissions.canManageTutorials) {
    supportItems.push({ title: "Video Tutorials", url: "/admin/tutorials", icon: Video });
  }
  if (supportItems.length > 0) {
    groups.push({ label: "Support & Content", items: supportItems });
  }

  // Admin Users
  if (permissions.canManageAdmins) {
    groups.push({
      label: "Administration",
      items: [{ title: "Admin Users", url: "/admin/users", icon: UserCog }],
    });
  }

  return groups;
};

interface AdminSidebarProps {
  permissions: AdminStaffPermissions | null;
}

export const AdminSidebar = ({ permissions }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile } = useProfile();

  const navGroups = getNavGroups(permissions);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={chamberboxIcon} alt="ChamberBox" className="w-8 h-8 rounded-lg flex-shrink-0" />
          {!collapsed && (
            <div>
              <span className="font-bold text-lg text-amber-100">Chamberbox</span>
              <p className="text-xs text-amber-200/60 -mt-0.5">Crafters</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {profile && !collapsed && (
          <div className="mb-3 p-3 rounded-lg bg-sidebar-accent/50">
            <p className="font-medium text-sm text-sidebar-foreground truncate">
              {profile.full_name || "Admin User"}
            </p>
            <div className="mt-1.5 space-y-1">
              {profile.email && (
                <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
