import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueue, QueueToken } from "@/hooks/useQueue";
import { useQueueSessions, QueueSession } from "@/hooks/useQueueSessions";
import { usePatients } from "@/hooks/usePatients";
import { SessionManager } from "@/components/queue/SessionManager";
import { NowServingCard } from "@/components/queue/NowServingCard";
import { PatientDetailDialog } from "@/components/queue/PatientDetailDialog";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Users,
  Loader2,
  UserPlus,
  Search,
  Plus,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Globe,
  Trash2,
  StickyNote
} from "lucide-react";
import { PrescriptionModal } from "@/components/queue/PrescriptionModal";
import { PaymentCollectionModal } from "@/components/queue/PaymentCollectionModal";
import { NoteDialog } from "@/components/queue/NoteDialog";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, isToday, isFuture } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const Queue = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<QueueSession | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"male" | "female" | "">("");
  const [newPatientIsFollowUp, setNewPatientIsFollowUp] = useState(false);
  const [newPatientVisitingReason, setNewPatientVisitingReason] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{ age?: string; gender?: string }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedPatientToken, setSelectedPatientToken] = useState<QueueToken | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  const [noteDialogToken, setNoteDialogToken] = useState<QueueToken | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [existingPatientReason, setExistingPatientReason] = useState("");
  
  const sessionDate = format(selectedDate, "yyyy-MM-dd");
  
  const {
    sessions,
    createSession,
    updateSessionStatus,
    toggleBookingOpen,
    deleteSession,
    updateMaxPatients,
    isCreating: isCreatingSession,
  } = useQueueSessions(sessionDate);

  const { 
    queue, 
    isLoading, 
    currentToken, 
    waitingCount, 
    completedCount,
    callNext,
    updateTokenStatus,
    addToQueue,
    linkPrescription,
    updatePaymentStatus,
    isAdding,
    deleteToken,
    updateNotes
  } = useQueue(selectedSession?.id, sessionDate);
  
  const { patients, addPatientAsync } = usePatients();

  const handleDateChange = (date: Date) => {
    setSelectedSession(null);
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const patientsInQueue = new Set(
    selectedSession 
      ? queue.filter(t => t.session_id === selectedSession.id).map(t => t.patient_id)
      : queue.map(t => t.patient_id)
  );
  
  const availablePatients = patients.filter((p) => {
    const notInQueue = !patientsInQueue.has(p.id);
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    return notInQueue && matchesSearch;
  });

  const handleAddToQueue = () => {
    if (!selectedExistingPatient) return;
    addToQueue(selectedExistingPatient.id, selectedSession?.id, selectedSession?.chamber_id, existingPatientReason || undefined);
    setIsAddDialogOpen(false);
    setSearchQuery("");
    setSelectedExistingPatient(null);
    setExistingPatientReason("");
  };

  const handleSelectExistingPatient = (patient: { id: string; name: string; phone: string }) => {
    setSelectedExistingPatient(patient);
  };

  const handleBackToPatientList = () => {
    setSelectedExistingPatient(null);
    setExistingPatientReason("");
  };

  const handleCreateAndAddToQueue = async () => {
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }

    const newErrors: { age?: string; gender?: string } = {};
    if (!newPatientAge || parseInt(newPatientAge) <= 0) {
      newErrors.age = "Age is required";
    }
    if (!newPatientGender) {
      newErrors.gender = "Gender is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    setFormErrors({});
    setIsCreating(true);
    try {
      const newPatient = await addPatientAsync({ 
        name: newPatientName.trim(), 
        phone: newPatientPhone.trim(),
        age: parseInt(newPatientAge),
        gender: newPatientGender as "male" | "female",
        blood_group: null,
        address: null,
        allergies: null,
        chronic_conditions: null,
      });
      
      if (newPatient?.id) {
        addToQueue(newPatient.id, selectedSession?.id, selectedSession?.chamber_id);
        toast.success(`${newPatientName} added to queue`);
      }
      
      setNewPatientName("");
      setNewPatientPhone("");
      setNewPatientAge("");
      setNewPatientGender("");
      setNewPatientIsFollowUp(false);
      setNewPatientVisitingReason("");
      setIsNewPatientDialogOpen(false);
    } catch (error) {
      console.error("Error creating patient:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMakePrescription = () => {
    if (currentToken) {
      setIsPrescriptionModalOpen(true);
    }
  };

  const handlePrescriptionSuccess = (prescriptionId: string) => {
    if (currentToken) {
      linkPrescription({ tokenId: currentToken.id, prescriptionId });
    }
    setIsPrescriptionModalOpen(false);
  };

  const handleCollectPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (amount: number, method: string) => {
    if (currentToken) {
      updatePaymentStatus({ tokenId: currentToken.id, amount, method });
    }
    setIsPaymentModalOpen(false);
  };

  const handleViewPrescription = (prescriptionId: string) => {
    navigate(`/dashboard/prescriptions?highlight=${prescriptionId}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this patient from queue?")) {
      deleteToken(id);
    }
  };

  const handleOpenNoteDialog = (token: QueueToken, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteDialogToken(token);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = (note: string) => {
    if (noteDialogToken) {
      updateNotes({ tokenId: noteDialogToken.id, notes: note });
    }
  };

  const handleCancel = (id: string) => {
    updateTokenStatus({ id, status: "cancelled" });
  };

  const waitingTokens = queue.filter((t) => t.status === "waiting");
  const completedTokens = queue.filter((t) => t.status === "completed" || t.status === "cancelled");

  const isTodaySelected = isToday(selectedDate);

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-4">
          <span>Queue Management</span>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateChange(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-8 px-3 font-medium text-sm",
                    isTodaySelected && "text-primary"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isTodaySelected ? "Today" : format(selectedDate, "EEE, MMM d")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateChange(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateChange(addDays(selectedDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {!isTodaySelected && (
            <Button
              variant="link"
              className="h-8 px-2 text-primary"
              onClick={() => handleDateChange(new Date())}
            >
              Go to Today
            </Button>
          )}
        </div>
      }
      actions={
        <div className="flex gap-2">
          <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSession}>
                <Plus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient to Queue</DialogTitle>
                <DialogDescription>
                  Create a new patient and add them to {selectedSession?.chamber?.name || "the queue"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Patient Name *</Label>
                    <Input
                      id="new-name"
                      placeholder="Enter patient name"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">Phone Number *</Label>
                    <Input
                      id="new-phone"
                      placeholder="01XXXXXXXXX"
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                      maxLength={11}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-age">Age *</Label>
                    <Input
                      id="new-age"
                      type="number"
                      placeholder="Age in years"
                      min="1"
                      max="150"
                      value={newPatientAge}
                      onChange={(e) => {
                        setNewPatientAge(e.target.value);
                        if (formErrors.age) setFormErrors({ ...formErrors, age: undefined });
                      }}
                      className={formErrors.age ? "border-destructive" : ""}
                    />
                    {formErrors.age && <p className="text-sm text-destructive">{formErrors.age}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-gender">Gender *</Label>
                    <Select
                      value={newPatientGender}
                      onValueChange={(value) => {
                        setNewPatientGender(value as "male" | "female");
                        if (formErrors.gender) setFormErrors({ ...formErrors, gender: undefined });
                      }}
                    >
                      <SelectTrigger className={formErrors.gender ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && <p className="text-sm text-destructive">{formErrors.gender}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="follow-up-toggle" className="text-sm font-medium">Follow-up Visit</Label>
                    <p className="text-xs text-muted-foreground">Toggle if this is a return visit</p>
                  </div>
                  <Switch
                    id="follow-up-toggle"
                    checked={newPatientIsFollowUp}
                    onCheckedChange={setNewPatientIsFollowUp}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visiting-reason">Visiting Reason (Optional)</Label>
                  <Textarea
                    id="visiting-reason"
                    placeholder="Briefly describe symptoms or reason for visit"
                    value={newPatientVisitingReason}
                    onChange={(e) => setNewPatientVisitingReason(e.target.value.slice(0, 200))}
                    className="resize-none h-16"
                  />
                  <p className="text-xs text-muted-foreground text-right">{newPatientVisitingReason.length}/200</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAndAddToQueue} disabled={isCreating || !newPatientName.trim() || !newPatientPhone.trim()}>
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><UserPlus className="mr-2 h-4 w-4" />Create & Add</>}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setSelectedExistingPatient(null);
              setExistingPatientReason("");
              setSearchQuery("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedSession}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Existing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedExistingPatient ? "Add Visit Details" : "Add Patient to Queue"}
                </DialogTitle>
                <DialogDescription>
                  {selectedExistingPatient 
                    ? `Adding ${selectedExistingPatient.name} to ${selectedSession?.chamber?.name || "the queue"}`
                    : `Select a patient to add to ${selectedSession?.chamber?.name || "the queue"}.`
                  }
                </DialogDescription>
              </DialogHeader>
              
              {selectedExistingPatient ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="font-medium text-foreground">{selectedExistingPatient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedExistingPatient.phone}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="existing-visiting-reason">Visiting Reason (Optional)</Label>
                    <Textarea
                      id="existing-visiting-reason"
                      placeholder="Briefly describe symptoms or reason for visit"
                      value={existingPatientReason}
                      onChange={(e) => setExistingPatientReason(e.target.value.slice(0, 200))}
                      className="resize-none h-20"
                    />
                    <p className="text-xs text-muted-foreground text-right">{existingPatientReason.length}/200</p>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button variant="outline" onClick={handleBackToPatientList}>
                      Back
                    </Button>
                    <Button onClick={handleAddToQueue} disabled={isAdding}>
                      {isAdding ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
                      ) : (
                        <><UserPlus className="mr-2 h-4 w-4" />Add to Queue</>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <ScrollArea className="h-[300px] pr-4">
                    {availablePatients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {patients.length === 0 ? <p>No patients registered yet</p> : searchQuery ? <p>No patients found matching "{searchQuery}"</p> : <p>All patients are already in the queue</p>}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availablePatients.map((patient) => (
                          <button 
                            key={patient.id} 
                            onClick={() => handleSelectExistingPatient({ id: patient.id, name: patient.name, phone: patient.phone })} 
                            className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-foreground">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.phone}</p>
                            </div>
                            <Badge variant="outline">Select</Badge>
                          </button>
                        ))}
                          </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sessions Section */}
        <SessionManager 
          sessions={sessions} 
          selectedSession={selectedSession} 
          onSelectSession={setSelectedSession} 
          onCreateSession={createSession} 
          onUpdateStatus={(id, status) => updateSessionStatus({ id, status })} 
          onToggleBooking={(id, booking_open) => toggleBookingOpen({ id, booking_open })} 
          onDeleteSession={deleteSession} 
          onUpdateMaxPatients={(id, max_patients) => updateMaxPatients({ id, max_patients })}
          isCreating={isCreatingSession} 
          sessionDate={sessionDate} 
        />

        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
          <Card className="border-l-4 border-l-success min-w-[140px] flex-shrink-0 lg:min-w-0">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning min-w-[140px] flex-shrink-0 lg:min-w-0">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{waitingCount}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary min-w-[140px] flex-shrink-0 lg:min-w-0">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{currentToken ? `#${currentToken.token_number}` : "—"}</p>
                  <p className="text-xs text-muted-foreground">Current</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

          {!selectedSession ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-10 sm:py-16 px-4">
                <CalendarClock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/30" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Select a Session</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto">Tap on a session above to start managing your queue</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              {currentToken && (
                <NowServingCard
                  token={currentToken}
                  onMakePrescription={handleMakePrescription}
                  onViewPrescription={handleViewPrescription}
                  onCollectPayment={handleCollectPayment}
                  onCancel={() => handleCancel(currentToken.id)}
                  onCallNext={callNext}
                  onCompleteOnly={async (skipIncomplete = false) => {
                    // Check if current patient has incomplete tasks
                    if (!skipIncomplete) {
                      const hasPrescription = !!currentToken.prescription_id;
                      const hasPayment = currentToken.payment_collected;
                      
                      if (!hasPrescription || !hasPayment) {
                        return { 
                          incomplete: true, 
                          hasPrescription, 
                          hasPayment 
                        };
                      }
                    }
                    
                    // Complete the current patient (without calling next)
                    updateTokenStatus({ id: currentToken.id, status: "completed" });
                    return { incomplete: false };
                  }}
                />
              )}

              {queue.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No patients in queue</h3>
                    <p className="text-muted-foreground mb-4">Add patients to get started</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setIsNewPatientDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Patient</Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Existing Patient</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {queue.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-warning" />Waiting ({waitingTokens.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] -mr-4 pr-4">
                        {waitingTokens.length === 0 ? (
                          <p className="text-center py-6 text-muted-foreground text-sm">No patients waiting</p>
                        ) : (
                          <div className="space-y-2">
                            {waitingTokens.map((token, index) => (
                              <button
                                key={token.id}
                                onClick={() => {
                                  setSelectedPatientToken(token);
                                  setIsPatientDetailOpen(true);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left hover:bg-muted/50",
                                  index === 0 && "bg-warning/5 border-warning/30 shadow-sm"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm", index === 0 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground")}>#{token.token_number}</div>
                                  <div>
                                    <p className="font-medium text-foreground text-sm">{token.patient?.name}</p>
                                    <p className="text-xs text-muted-foreground">{token.patient?.phone}</p>
                                    {token.serial_number && (
                                      <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{token.serial_number}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {token.booked_by === "public" && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                                      <Globe className="w-2.5 h-2.5 mr-0.5" />
                                      Online
                                    </Badge>
                                  )}
                                  {token.visiting_reason && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                      Has Reason
                                    </Badge>
                                  )}
                                  {token.notes && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                                      <StickyNote className="w-2.5 h-2.5 mr-0.5" />
                                      Note
                                    </Badge>
                                  )}
                                  {index === 0 && !currentToken && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 px-3 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateTokenStatus({ id: token.id, status: "current" });
                                      }}
                                    >
                                      <Play className="w-3 h-3 mr-1" />
                                      Call
                                    </Button>
                                  )}
                                  {index === 0 && currentToken && <Badge className="bg-warning/20 text-warning border-0 text-xs">Next</Badge>}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn(
                                      "h-7 w-7 p-0 text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10",
                                      token.notes && "text-purple-500"
                                    )}
                                    onClick={(e) => handleOpenNoteDialog(token, e)}
                                    title={token.notes ? "Edit note" : "Add note"}
                                  >
                                    <StickyNote className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleDelete(token.id, e)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />Completed ({completedTokens.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] -mr-4 pr-4">
                        {completedTokens.length === 0 ? (
                          <p className="text-center py-6 text-muted-foreground text-sm">No patients completed yet</p>
                        ) : (
                          <div className="space-y-2">
                            {completedTokens.map((token) => (
                              <button
                                key={token.id}
                                onClick={() => {
                                  setSelectedPatientToken(token);
                                  setIsPatientDetailOpen(true);
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/20 transition-all text-left hover:bg-accent"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">#{token.token_number}</div>
                                  <div>
                                    <p className="font-medium text-foreground text-sm">{token.patient?.name}</p>
                                    <p className="text-xs text-muted-foreground">{token.patient?.phone}</p>
                                    {token.serial_number && (
                                      <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{token.serial_number}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {token.booked_by === "public" && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                                      <Globe className="w-2.5 h-2.5 mr-0.5" />
                                      Online
                                    </Badge>
                                  )}
                                  <Badge variant={token.status === "completed" ? "secondary" : "destructive"} className="text-xs">{token.status === "completed" ? "Done" : "Cancelled"}</Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={currentToken?.patient ? { id: currentToken.patient_id, name: currentToken.patient.name, phone: currentToken.patient.phone, age: currentToken.patient.age, gender: currentToken.patient.gender } : null}
        onSuccess={handlePrescriptionSuccess}
      />

      <PaymentCollectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        patient={currentToken?.patient ? { id: currentToken.patient_id, name: currentToken.patient.name, phone: currentToken.patient.phone } : null}
        tokenNumber={currentToken?.token_number}
        onSuccess={handlePaymentSuccess}
      />

      <PatientDetailDialog
        token={selectedPatientToken}
        open={isPatientDetailOpen}
        onOpenChange={setIsPatientDetailOpen}
      />

      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        currentNote={noteDialogToken?.notes || null}
        patientName={noteDialogToken?.patient?.name || "Patient"}
        onSave={handleSaveNote}
      />
    </DashboardLayout>
  );
};

export default Queue;
