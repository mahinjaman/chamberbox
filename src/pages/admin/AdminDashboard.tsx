import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Users, UserCheck, MessageSquare, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { doctors, doctorsLoading } = useAdmin();
  const { tickets, ticketsLoading } = useSupportTickets();

  const stats = {
    totalDoctors: doctors?.length || 0,
    approvedDoctors: doctors?.filter(d => d.is_approved).length || 0,
    pendingApproval: doctors?.filter(d => !d.is_approved).length || 0,
    activeSubscriptions: doctors?.filter(d => 
      d.subscription_tier && 
      d.subscription_tier !== "trial" &&
      (!d.subscription_expires_at || new Date(d.subscription_expires_at) > new Date())
    ).length || 0,
    openTickets: tickets?.filter(t => t.status === "open").length || 0,
  };

  const isLoading = doctorsLoading || ticketsLoading;

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Overview of platform management"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/doctors">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
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
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
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
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
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
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : stats.pendingApproval > 0 ? (
                <div className="space-y-2">
                  {doctors?.filter(d => !d.is_approved).slice(0, 5).map((doctor) => (
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
        </div>
      </div>
    </AdminLayout>
  );
}
