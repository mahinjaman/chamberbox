import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, MessageSquare, CreditCard, AlertTriangle, DatabaseBackup, Loader2, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { addDays, formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { doctors, doctorsLoading } = useAdmin();
  const { tickets, ticketsLoading } = useSupportTickets();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch recent contact messages
  const { data: contactMessages, isLoading: contactsLoading } = useQuery({
    queryKey: ["recentContactMessages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Check if user is super_admin
  const { data: isSuperAdmin } = useQuery({
    queryKey: ["isSuperAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .rpc("has_role", { _user_id: user.id, _role: "super_admin" });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user?.id,
  });

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-database");
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chamberbox_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Database backup downloaded successfully!");
    } catch (err: any) {
      console.error("Backup failed:", err);
      toast.error("Backup failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const now = new Date();
  const sevenDaysFromNow = addDays(now, 7);

  const stats = {
    totalDoctors: doctors?.length || 0,
    approvedDoctors: doctors?.filter(d => d.approval_status === "approved").length || 0,
    pendingApproval: doctors?.filter(d => !d.approval_status || d.approval_status === "pending").length || 0,
    activeSubscriptions: doctors?.filter(d => 
      d.approval_status === "approved" &&
      d.subscription_expires_at && 
      new Date(d.subscription_expires_at) > new Date()
    ).length || 0,
    openTickets: tickets?.filter(t => t.status === "open").length || 0,
    expiringSoon: doctors?.filter(d => {
      if (!d.subscription_expires_at) return false;
      const expiryDate = new Date(d.subscription_expires_at);
      return expiryDate > now && expiryDate <= sevenDaysFromNow;
    }).length || 0,
  };

  const isLoading = doctorsLoading || ticketsLoading;

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Overview of platform management"
    >
      <div className="space-y-6">
        {/* Super Admin: Database Backup */}
        {isSuperAdmin && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <DatabaseBackup className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-muted-foreground">Download full database as JSON file</p>
                </div>
              </div>
              <Button onClick={handleBackup} disabled={isExporting} size="sm">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DatabaseBackup className="h-4 w-4 mr-2" />
                    Download Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Link to="/admin/doctors">
            <Card className="hover:shadow-md transition-all cursor-pointer bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stats.totalDoctors}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingApproval} pending approval
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/doctors">
            <Card className="hover:shadow-md transition-all cursor-pointer bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stats.approvedDoctors}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active on platform
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/subscriptions">
            <Card className="hover:shadow-md transition-all cursor-pointer bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stats.activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid plans
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/tickets">
            <Card className="hover:shadow-md transition-all cursor-pointer bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stats.openTickets}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/subscriptions?filter=expiring">
            <Card className="hover:shadow-md transition-all cursor-pointer bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {isLoading ? "..." : stats.expiringSoon}
                </div>
                <p className="text-xs text-muted-foreground">
                  Within 7 days
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : stats.pendingApproval > 0 ? (
                <div className="space-y-2">
                  {doctors?.filter(d => !d.approval_status || d.approval_status === "pending").slice(0, 5).map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{doctor.full_name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      </div>
                      <Link 
                        to="/admin/doctors" 
                        className="text-sm text-primary hover:underline"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No pending approvals</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.filter(t => t.status === "open").slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium line-clamp-1">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user_name}</p>
                      </div>
                      <Link 
                        to="/admin/tickets" 
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No open tickets</p>
              )}
            </CardContent>
          </Card>

          {/* Contact Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Recent Messages
              </CardTitle>
              <Link to="/admin/contacts" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : contactMessages && contactMessages.length > 0 ? (
                <div className="space-y-2">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm line-clamp-1">{msg.name}</p>
                        {!msg.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{msg.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No messages yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
