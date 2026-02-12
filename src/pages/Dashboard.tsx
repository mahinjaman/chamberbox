import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients } from "@/hooks/usePatients";
import { useQueue } from "@/hooks/useQueue";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useQueueSessions } from "@/hooks/useQueueSessions";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { AddTransactionDialog } from "@/components/finance/AddTransactionDialog";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { 
  Users, 
  Clock, 
  CreditCard, 
  UserPlus,
  ArrowRight,
  Banknote,
  Calendar,
  MessageSquare,
  TrendingDown,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const Dashboard = () => {
  const { profile } = useProfile();
  const { patients } = usePatients();
  const { currentToken, waitingCount, completedCount } = useQueue();
  const { todayStats } = useTransactions();
  const { sessions } = useQueueSessions();
  const { tickets } = useSupportTickets();
  const { t, language } = useLanguage();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);

  const todaysPatients = completedCount + (currentToken ? 1 : 0);
  const today = new Date();
  const formattedDate = format(today, language === "bn" ? "dd MMMM, yyyy (EEEE)" : "MMMM dd, yyyy (EEEE)", {
    locale: language === "bn" ? bn : undefined
  });

  // Filter user's own tickets
  const userTickets = tickets?.filter(t => t.user_id === profile?.user_id) || [];
  const openTickets = userTickets.filter(t => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = userTickets.filter(t => t.status === "resolved");

  // Session stats
  const runningSessions = sessions.filter(s => s.status === "running");
  const openSessions = sessions.filter(s => s.status === "open");
  const totalTokensToday = sessions.reduce((acc, s) => acc + (s.tokens_count || 0), 0);

  return (
    <DashboardLayout
      title={`${t.dashboard.welcome}, ${profile?.full_name?.split(" ")[0] || "Doctor"}!`}
      description={formattedDate}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title={t.dashboard.todayAppointments}
          value={todaysPatients}
          description={`${waitingCount} ${t.queue.patientsWaiting.toLowerCase()}`}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title={t.queue.currentToken}
          value={currentToken ? `#${currentToken.token_number}` : "—"}
          description={currentToken?.patient?.name || t.queue.queueEmpty}
          icon={<Clock className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title={language === "bn" ? "আজকের আয়" : "Today's Revenue"}
          value={`৳${todayStats.income.toLocaleString()}`}
          description={t.finances.income}
          icon={<CreditCard className="w-6 h-6" />}
          variant="accent"
        />
        <StatsCard
          title={language === "bn" ? "আজকের খরচ" : "Today's Expense"}
          value={`৳${todayStats.expense.toLocaleString()}`}
          description={t.finances.expense}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.quickActions}</CardTitle>
            <CardDescription>{t.common.actions}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" className="justify-start h-auto py-4" onClick={() => setIsPatientDialogOpen(true)}>
                <UserPlus className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.dashboard.newPatient}</div>
                  <div className="text-xs opacity-80">{t.patients.addPatient}</div>
                </div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => setIsTransactionDialogOpen(true)}
            >
              <Banknote className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{t.finances.addTransaction}</div>
                <div className="text-xs opacity-80">{t.finances.income} / {t.finances.expense}</div>
              </div>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/patients">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.patients.title}</div>
                  <div className="text-xs opacity-80">{t.common.search}</div>
                </div>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/queue">
                <Clock className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.queue.queueManagement}</div>
                  <div className="text-xs opacity-80">{t.common.today}</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {language === "bn" ? "আজকের সেশন" : "Today's Sessions"}
              </CardTitle>
              <CardDescription>
                {sessions.length} {language === "bn" ? "সেশন" : "sessions"} • {totalTokensToday} {language === "bn" ? "রোগী" : "patients"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/queue">
                {t.common.view} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{language === "bn" ? "আজকে কোনো সেশন নেই" : "No sessions today"}</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/queue">{language === "bn" ? "সেশন তৈরি করুন" : "Create session"}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 4).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.chamber?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)} • {session.tokens_count || 0} {language === "bn" ? "রোগী" : "patients"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        session.status === "running"
                          ? "default"
                          : session.status === "closed"
                          ? "secondary"
                          : "outline"
                      }
                      className={session.status === "running" ? "bg-success text-success-foreground" : ""}
                    >
                      {session.status === "running" 
                        ? (language === "bn" ? "চলমান" : "Running")
                        : session.status === "open" 
                        ? (language === "bn" ? "খোলা" : "Open")
                        : session.status === "closed"
                        ? (language === "bn" ? "বন্ধ" : "Closed")
                        : session.status
                      }
                    </Badge>
                  </div>
                ))}
                {sessions.length > 4 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{sessions.length - 4} {language === "bn" ? "আরো সেশন" : "more sessions"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Ticket Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {language === "bn" ? "সাপোর্ট টিকেট" : "Support Tickets"}
              </CardTitle>
              <CardDescription>
                {language === "bn" ? "আপনার টিকেটের অবস্থা" : "Your ticket status"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/tickets">
                {t.common.view} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {userTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{language === "bn" ? "কোনো টিকেট নেই" : "No tickets yet"}</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/tickets">{language === "bn" ? "টিকেট তৈরি করুন" : "Create a ticket"}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="text-2xl font-bold text-warning">{openTickets.length}</div>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" ? "চলমান টিকেট" : "Open Tickets"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="text-2xl font-bold text-success">{resolvedTickets.length}</div>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" ? "সমাধান হয়েছে" : "Resolved"}
                    </p>
                  </div>
                </div>
                {openTickets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {language === "bn" ? "সাম্প্রতিক" : "Recent"}
                    </p>
                    {openTickets.slice(0, 2).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                        <span className="text-sm truncate max-w-[180px]">{ticket.subject}</span>
                        <Badge variant="outline" className="text-xs">
                          {ticket.status === "open" 
                            ? (language === "bn" ? "খোলা" : "Open")
                            : (language === "bn" ? "চলমান" : "In Progress")
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{language === "bn" ? "সারসংক্ষেপ" : "Summary"}</CardTitle>
            <CardDescription>{language === "bn" ? "সামগ্রিক পরিসংখ্যান" : "Overall statistics"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{t.dashboard.totalPatients}</span>
              </div>
              <span className="text-lg font-bold">{patients.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">{language === "bn" ? "আজকের সেশন" : "Today's Sessions"}</span>
              </div>
              <span className="text-lg font-bold">{sessions.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium">{language === "bn" ? "অপেক্ষারত" : "Waiting"}</span>
              </div>
              <span className="text-lg font-bold">{waitingCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">{language === "bn" ? "আজকের নেট আয়" : "Today's Net"}</span>
              </div>
              <span className="text-lg font-bold text-success">
                ৳{(todayStats.income - todayStats.expense).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog 
        open={isTransactionDialogOpen} 
        onOpenChange={setIsTransactionDialogOpen} 
      />
      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
