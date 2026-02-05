import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Video,
  LogOut,
  Shield,
  Settings,
   CheckCircle,
   UserCog,
   Mail,
   Phone,
   BarChart3
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

const mainNavItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
 ];
 
 const getNavItems = (permissions: AdminStaffPermissions | null) => {
   if (!permissions) return mainNavItems;
   
   const items = [...mainNavItems];
   
   if (permissions.canManageDoctors) {
     items.push({ title: "Doctors", url: "/admin/doctors", icon: Users });
   }
   if (permissions.canManageSubscriptions) {
     items.push({ title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard });
   }
   if (permissions.canVerifyPayments) {
     items.push({ title: "Payments", url: "/admin/payments", icon: CheckCircle });
      items.push({ title: "Analytics", url: "/admin/analytics", icon: BarChart3 });
   }
   if (permissions.canConfigurePlans) {
     items.push({ title: "Plan Config", url: "/admin/plans", icon: Settings });
   }
   if (permissions.canManageTickets) {
     items.push({ title: "Support Tickets", url: "/admin/tickets", icon: MessageSquare });
   }
   if (permissions.canManageTutorials) {
     items.push({ title: "Video Tutorials", url: "/admin/tutorials", icon: Video });
   }
   if (permissions.canManageAdmins) {
     items.push({ title: "Admin Users", url: "/admin/users", icon: UserCog });
   }
   
   return items;
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
 
   const navItems = getNavItems(permissions);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="text-primary-foreground w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg text-sidebar-foreground">Chamberbox</span>
              <p className="text-xs text-sidebar-foreground/60 -mt-0.5">Crafters</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
               {navItems.map((item) => (
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
