import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Clock, Play, Plus, Search, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StaffQueue() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"male" | "female" | "">("");

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
        .select(`*, chamber:chambers(id, name, address)`)
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
        .select(`*, patient:patients(id, name, phone, age, gender)`)
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

  // Fetch patients for adding to queue
  const { data: patients = [] } = useQuery({
    queryKey: ["staff_patients_list", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Add to queue mutation
  const addToQueueMutation = useMutation({
    mutationFn: async (patientId: string) => {
      if (!doctorId || !selectedSessionId) throw new Error("No session selected");
      
      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      const maxToken = queueItems.length > 0 
        ? Math.max(...queueItems.map(q => q.token_number)) 
        : 0;
      
      const { data, error } = await supabase
        .from("queue_tokens")
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          session_id: selectedSessionId,
          chamber_id: selectedSession?.chamber_id,
          token_number: maxToken + 1,
          queue_date: today,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_queue"] });
      setIsAddDialogOpen(false);
      setSearchQuery("");
      toast.success(language === "bn" ? "কিউতে যোগ করা হয়েছে" : "Added to queue");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; age: number; gender: string }) => {
      if (!doctorId) throw new Error("No doctor ID");
      
      const { data: newPatient, error } = await supabase
        .from("patients")
        .insert({
          doctor_id: doctorId,
          name: data.name,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
        })
        .select()
        .single();

      if (error) throw error;
      return newPatient;
    },
    onSuccess: async (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ["staff_patients_list"] });
      // Add to queue
      await addToQueueMutation.mutateAsync(newPatient.id);
      setIsNewPatientDialogOpen(false);
      setNewPatientName("");
      setNewPatientPhone("");
      setNewPatientAge("");
      setNewPatientGender("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update token status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("queue_tokens")
        .update({ 
          status,
          ...(status === "current" ? { called_at: new Date().toISOString() } : {}),
          ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_queue"] });
    },
  });

  // Call next patient
  const callNextMutation = useMutation({
    mutationFn: async () => {
      // First complete current patient if any
      const currentPatient = queueItems.find(q => q.status === "current");
      if (currentPatient) {
        await supabase
          .from("queue_tokens")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", currentPatient.id);
      }
      
      // Call next waiting patient
      const nextWaiting = queueItems
        .filter(q => q.status === "waiting")
        .sort((a, b) => a.token_number - b.token_number)[0];
      
      if (nextWaiting) {
        await supabase
          .from("queue_tokens")
          .update({ status: "current", called_at: new Date().toISOString() })
          .eq("id", nextWaiting.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_queue"] });
      toast.success(language === "bn" ? "পরবর্তী রোগী ডাকা হয়েছে" : "Called next patient");
    },
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

  const patientsInQueue = new Set(queueItems.map(q => q.patient_id));
  const availablePatients = patients.filter(p => 
    !patientsInQueue.has(p.id) &&
    (searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery))
  );

  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy");
  const waitingCount = queueItems.filter((q) => q.status === "waiting").length;
  const completedCount = queueItems.filter((q) => q.status === "completed").length;
  const currentPatient = queueItems.find((q) => q.status === "current");
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <StaffLayout 
      title={language === "bn" ? "কিউ ম্যানেজমেন্ট" : "Queue Management"}
      description={todayDisplay}
      actions={
        selectedSessionId && (
          <div className="flex gap-2">
            {/* New Patient Dialog */}
            <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {language === "bn" ? "নতুন রোগী" : "New Patient"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "bn" ? "নতুন রোগী যোগ করুন" : "Add New Patient"}</DialogTitle>
                  <DialogDescription>
                    {language === "bn" 
                      ? "নতুন রোগী তৈরি করুন এবং কিউতে যোগ করুন" 
                      : "Create a new patient and add to queue"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{language === "bn" ? "নাম *" : "Name *"}</Label>
                      <Input
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder={language === "bn" ? "রোগীর নাম" : "Patient name"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "bn" ? "ফোন *" : "Phone *"}</Label>
                      <Input
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "bn" ? "বয়স *" : "Age *"}</Label>
                      <Input
                        type="number"
                        value={newPatientAge}
                        onChange={(e) => setNewPatientAge(e.target.value)}
                        placeholder={language === "bn" ? "বছর" : "Years"}
                        min="1"
                        max="150"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "bn" ? "লিঙ্গ *" : "Gender *"}</Label>
                      <Select value={newPatientGender} onValueChange={(v) => setNewPatientGender(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "bn" ? "নির্বাচন করুন" : "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{language === "bn" ? "পুরুষ" : "Male"}</SelectItem>
                          <SelectItem value="female">{language === "bn" ? "মহিলা" : "Female"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!newPatientName || !newPatientPhone || !newPatientAge || !newPatientGender) {
                        toast.error(language === "bn" ? "সব তথ্য পূরণ করুন" : "Fill all required fields");
                        return;
                      }
                      createPatientMutation.mutate({
                        name: newPatientName,
                        phone: newPatientPhone,
                        age: parseInt(newPatientAge),
                        gender: newPatientGender,
                      });
                    }}
                    disabled={createPatientMutation.isPending}
                  >
                    {createPatientMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <UserPlus className="w-4 h-4 mr-1" />
                    {language === "bn" ? "তৈরি করুন" : "Create & Add"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Existing Patient Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-1" />
                  {language === "bn" ? "বিদ্যমান রোগী" : "Add Existing"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "bn" ? "কিউতে যোগ করুন" : "Add to Queue"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === "bn" ? "নাম বা ফোন দিয়ে খুঁজুন..." : "Search by name or phone..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-[300px]">
                    {availablePatients.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {language === "bn" ? "কোনো রোগী পাওয়া যায়নি" : "No patients found"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availablePatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => addToQueueMutation.mutate(patient.id)}
                            disabled={addToQueueMutation.isPending}
                            className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.phone}</p>
                            </div>
                            <Badge variant="outline">{language === "bn" ? "যোগ করুন" : "Add"}</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>

            {/* Call Next Button */}
            <Button 
              onClick={() => callNextMutation.mutate()} 
              disabled={waitingCount === 0 || callNextMutation.isPending}
            >
              {callNextMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Play className="w-4 h-4 mr-1" />
              {language === "bn" ? "পরবর্তী ডাকুন" : "Call Next"}
            </Button>
          </div>
        )
      }
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
                      <div className="flex items-center gap-2">
                        {item.status === "waiting" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: item.id, status: "current" })}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatusMutation.mutate({ id: item.id, status: "cancelled" })}
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {item.status === "current" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatusMutation.mutate({ id: item.id, status: "completed" })}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {language === "bn" ? "সম্পন্ন" : "Complete"}
                          </Button>
                        )}
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
                            : item.status === "completed"
                            ? (language === "bn" ? "সম্পন্ন" : "Completed")
                            : (language === "bn" ? "বাতিল" : "Cancelled")}
                        </Badge>
                      </div>
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
