import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueue, QueueToken } from "@/hooks/useQueue";
import { useQueueSessions, QueueSession } from "@/hooks/useQueueSessions";
import { usePatients } from "@/hooks/usePatients";
import { SessionManager } from "@/components/queue/SessionManager";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Users,
  Loader2,
  UserPlus,
  Search,
  Plus,
  FileText,
  SkipForward,
  CalendarClock,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { PrescriptionModal } from "@/components/queue/PrescriptionModal";
import { PaymentCollectionModal } from "@/components/queue/PaymentCollectionModal";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, isSameDay, isToday, isFuture } from "date-fns";
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
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Queue = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<QueueSession | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isPrescriptionPromptOpen, setIsPrescriptionPromptOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completingToken, setCompletingToken] = useState<QueueToken | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"male" | "female" | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{ age?: string; gender?: string }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const sessionDate = format(selectedDate, "yyyy-MM-dd");
  
  const {
    sessions,
    isLoading: isLoadingSessions,
    createSession,
    updateSessionStatus,
    deleteSession,
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
    isAdding
  } = useQueue(selectedSession?.id, sessionDate);
  
  const { patients, addPatientAsync } = usePatients();

  // Reset selected session when date changes
  const handleDateChange = (date: Date) => {
    setSelectedSession(null);
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  // Get patient IDs already in today's queue for the selected session (or all if no session)
  const patientsInQueue = new Set(
    selectedSession 
      ? queue.filter(t => t.session_id === selectedSession.id).map(t => t.patient_id)
      : queue.map(t => t.patient_id)
  );
  
  // Filter patients not in queue and by search
  const availablePatients = patients.filter((p) => {
    const notInQueue = !patientsInQueue.has(p.id);
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    return notInQueue && matchesSearch;
  });

  const handleAddToQueue = (patientId: string) => {
    addToQueue(patientId, selectedSession?.id, selectedSession?.chamber_id);
    setIsAddDialogOpen(false);
    setSearchQuery("");
  };

  const handleCreateAndAddToQueue = async () => {
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }

    // Validate mandatory fields
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
      // Create patient and get the returned data with ID
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
        // Add the newly created patient to queue
        addToQueue(newPatient.id, selectedSession?.id, selectedSession?.chamber_id);
        toast.success(`${newPatientName} added to queue`);
      }
      
      // Reset form
      setNewPatientName("");
      setNewPatientPhone("");
      setNewPatientAge("");
      setNewPatientGender("");
      setIsNewPatientDialogOpen(false);
    } catch (error) {
      console.error("Error creating patient:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCallNextClick = () => {
    // If there's a current patient, show prescription prompt
    if (currentToken) {
      setIsPrescriptionPromptOpen(true);
    } else {
      // No current patient, just call next
      callNext();
    }
  };

  const handleMakePrescription = () => {
    if (currentToken) {
      setIsPrescriptionModalOpen(true);
    }
  };

  const handleSkipPrescription = async () => {
    setIsPrescriptionPromptOpen(false);
    await callNext();
  };

  const handleMakePrescriptionAndCallNext = () => {
    setIsPrescriptionPromptOpen(false);
    if (currentToken) {
      setIsPrescriptionModalOpen(true);
    }
  };

  const handlePrescriptionSuccess = async () => {
    setIsPrescriptionModalOpen(false);
    // After prescription is saved, call next patient
    await callNext();
  };

  const handleComplete = (token: QueueToken) => {
    setCompletingToken(token);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (completingToken) {
      updateTokenStatus({ id: completingToken.id, status: "completed" });
    }
    setCompletingToken(null);
  };

  const handleCancel = (id: string) => {
    updateTokenStatus({ id, status: "cancelled" });
  };

  const waitingTokens = queue.filter((t) => t.status === "waiting");
  const completedTokens = queue.filter((t) => t.status === "completed" || t.status === "cancelled");

  const isTodaySelected = isToday(selectedDate);
  const isFutureDate = isFuture(selectedDate) && !isTodaySelected;

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-4">
          <span>Queue Management</span>
          {/* Date Navigation */}
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
          {/* New Patient Button */}
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
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewPatientDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAndAddToQueue}
                  disabled={isCreating || !newPatientName.trim() || !newPatientPhone.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create & Add
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Existing Patient Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedSession}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Existing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Patient to Queue</DialogTitle>
                <DialogDescription>
                  Select a patient to add to {selectedSession?.chamber?.name || "the queue"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[300px] pr-4">
                  {availablePatients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {patients.length === 0 ? (
                        <p>No patients registered yet</p>
                      ) : searchQuery ? (
                        <p>No patients found matching "{searchQuery}"</p>
                      ) : (
                        <p>All patients are already in the queue</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availablePatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleAddToQueue(patient.id)}
                          disabled={isAdding}
                          className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50"
                        >
                          <div>
                            <p className="font-medium text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                          </div>
                          {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Badge variant="outline">Add</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleCallNextClick} 
            disabled={!isTodaySelected || waitingCount === 0 && !currentToken}
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Call Next Patient
          </Button>
        </div>
      }
    >
      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Sidebar: Sessions */}
        <div className="lg:col-span-3">
          <SessionManager
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
            onCreateSession={createSession}
            onUpdateStatus={(id, status) => updateSessionStatus({ id, status })}
            onDeleteSession={deleteSession}
            isCreating={isCreatingSession}
            sessionDate={sessionDate}
          />
        </div>

        {/* Main Content: Queue */}
        <div className="lg:col-span-9 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-3">
            <Card className="border-l-4 border-l-success">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
                    <p className="text-xs text-muted-foreground">Waiting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {currentToken ? `#${currentToken.token_number}` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          {!selectedSession ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-16">
                <CalendarClock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Select a Session</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create or select a session from the left panel to start managing patients
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Patient Card */}
              {currentToken && (
                <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping"></div>
                      </div>
                      <CardTitle className="text-base">Now Serving</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center text-success-foreground shadow-lg">
                          <span className="text-2xl font-bold">#{currentToken.token_number}</span>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {currentToken.patient?.name}
                          </p>
                          <p className="text-muted-foreground">{currentToken.patient?.phone}</p>
                          {currentToken.patient?.age && (
                            <p className="text-sm text-muted-foreground">
                              {currentToken.patient.age} yrs, {currentToken.patient.gender}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={handleMakePrescription}>
                          <FileText className="mr-2 h-4 w-4" />
                          Prescription
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(currentToken)}
                        >
                          <Banknote className="mr-2 h-4 w-4" />
                          Complete & Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancel(currentToken.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No patients state */}
              {queue.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No patients in queue</h3>
                    <p className="text-muted-foreground mb-4">
                      Add patients to get started
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setIsNewPatientDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Patient
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Existing Patient
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Waiting & Completed Lists */}
              {queue.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Waiting List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-warning" />
                            Waiting
                          </CardTitle>
                          <CardDescription>{waitingTokens.length} patients</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] -mr-4 pr-4">
                        {waitingTokens.length === 0 ? (
                          <p className="text-center py-6 text-muted-foreground text-sm">
                            No patients waiting
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {waitingTokens.map((token, index) => (
                              <div
                                key={token.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                                  index === 0 && "bg-warning/5 border-warning/30 shadow-sm"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm",
                                      index === 0
                                        ? "bg-warning text-warning-foreground"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    #{token.token_number}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground text-sm">
                                      {token.patient?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {token.patient?.phone}
                                    </p>
                                  </div>
                                </div>
                                {index === 0 && (
                                  <Badge className="bg-warning/20 text-warning border-0 text-xs">
                                    Next
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Completed List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Completed
                          </CardTitle>
                          <CardDescription>{completedTokens.length} patients</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] -mr-4 pr-4">
                        {completedTokens.length === 0 ? (
                          <p className="text-center py-6 text-muted-foreground text-sm">
                            No patients completed yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {completedTokens.map((token) => (
                              <div
                                key={token.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                                    #{token.token_number}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground text-sm">
                                      {token.patient?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {token.patient?.phone}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant={token.status === "completed" ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {token.status === "completed" ? "Done" : "Cancelled"}
                                </Badge>
                              </div>
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

      {/* Prescription Prompt Dialog */}
      <Dialog open={isPrescriptionPromptOpen} onOpenChange={setIsPrescriptionPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Prescription?</DialogTitle>
            <DialogDescription>
              {currentToken?.patient?.name} is currently being served. Would you like to create a prescription before calling the next patient?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleMakePrescriptionAndCallNext} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Make Prescription
            </Button>
            <Button variant="outline" onClick={handleSkipPrescription} className="w-full">
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Call Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={currentToken?.patient ? {
          id: currentToken.patient_id,
          name: currentToken.patient.name,
          phone: currentToken.patient.phone,
          age: currentToken.patient.age,
          gender: currentToken.patient.gender,
        } : null}
        onSuccess={handlePrescriptionSuccess}
      />

      {/* Payment Collection Modal */}
      <PaymentCollectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCompletingToken(null);
        }}
        patient={completingToken?.patient ? {
          id: completingToken.patient_id,
          name: completingToken.patient.name,
          phone: completingToken.patient.phone,
        } : null}
        tokenNumber={completingToken?.token_number}
        onSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
};

export default Queue;
