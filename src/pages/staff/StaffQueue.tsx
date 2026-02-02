import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Clock, Play, Plus } from "lucide-react";
import { format } from "date-fns";

export default function StaffQueue() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch sessions for the doctor
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["staff_queue_sessions", doctorId, today],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("queue_sessions")
        .select(`
          *,
          chamber:chambers(name, address)
        `)
        .eq("doctor_id", doctorId)
        .eq("session_date", today)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Fetch queue for selected session
  const { data: queueItems = [], isLoading: queueLoading } = useQuery({
    queryKey: ["staff_queue", doctorId, selectedSessionId, today],
    queryFn: async () => {
      if (!doctorId) return [];
      
      let query = supabase
        .from("queue_tokens")
        .select(`
          *,
          patient:patients(name, phone, age, gender)
        `)
        .eq("doctor_id", doctorId)
        .eq("queue_date", today)
        .order("token_number", { ascending: true });
      
      if (selectedSessionId) {
        query = query.eq("session_id", selectedSessionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canManageQueue) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "কিউ ম্যানেজমেন্ট" : "Queue Management"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canManageQueue) {
    return null;
  }

  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy");
  const waitingCount = queueItems.filter((q) => q.status === "waiting").length;
  const completedCount = queueItems.filter((q) => q.status === "completed").length;
  const currentPatient = queueItems.find((q) => q.status === "current");
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <StaffLayout 
      title={language === "bn" ? "কিউ ম্যানেজমেন্ট" : "Queue Management"}
      description={todayDisplay}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "সম্পন্ন" : "Completed"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <Clock className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitingCount}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "অপেক্ষমাণ" : "Waiting"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent">
                <Play className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentPatient ? `#${currentPatient.token_number}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "বর্তমান" : "Current"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions and Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {language === "bn" ? "সেশন" : "Sessions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === "bn" ? "আজ কোনো সেশন নেই" : "No sessions today"}</p>
                  <p className="text-xs mt-1">
                    {language === "bn" ? "ডাক্তার সেশন তৈরি করবেন" : "Doctor will create sessions"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSessionId === session.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {session.start_time} - {session.end_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(session as any).chamber?.name}
                          </p>
                        </div>
                        <Badge variant={session.status === "running" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Queue List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === "bn" ? "কিউ" : "Queue"}
                {selectedSession && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({(selectedSession as any).chamber?.name})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSessionId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {language === "bn" ? "সেশন নির্বাচন করুন" : "Select a Session"}
                  </p>
                  <p className="text-sm">
                    {language === "bn" 
                      ? "কিউ দেখতে একটি সেশন নির্বাচন করুন"
                      : "Select a session to view the queue"}
                  </p>
                </div>
              ) : queueLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : queueItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {language === "bn" ? "কিউ খালি" : "Queue is Empty"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queueItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border flex items-center justify-between ${
                        item.status === "current" 
                          ? "border-primary bg-primary/5" 
                          : item.status === "completed"
                          ? "bg-muted/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                          {item.token_number}
                        </div>
                        <div>
                          <p className="font-medium">{(item.patient as any)?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(item.patient as any)?.phone}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.status === "current" 
                            ? "default" 
                            : item.status === "completed" 
                            ? "secondary" 
                            : "outline"
                        }
                      >
                        {item.status === "waiting" 
                          ? (language === "bn" ? "অপেক্ষমাণ" : "Waiting")
                          : item.status === "current"
                          ? (language === "bn" ? "চলমান" : "In Progress")
                          : (language === "bn" ? "সম্পন্ন" : "Completed")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
