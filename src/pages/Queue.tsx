import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueue } from "@/hooks/useQueue";
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
  CalendarClock
} from "lucide-react";
import { PrescriptionModal } from "@/components/queue/PrescriptionModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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

const Queue = () => {
  const [selectedSession, setSelectedSession] = useState<QueueSession | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isPrescriptionPromptOpen, setIsPrescriptionPromptOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"male" | "female" | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{ age?: string; gender?: string }>({});
  
  const sessionDate = new Date().toISOString().split("T")[0];
  
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

  // Get patient IDs already in today's queue
  const patientsInQueue = new Set(queue.map((t) => t.patient_id));
  
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

  const handleComplete = (id: string) => {
    updateTokenStatus({ id, status: "completed" });
  };

  const handleCancel = (id: string) => {
    updateTokenStatus({ id, status: "cancelled" });
  };

  const waitingTokens = queue.filter((t) => t.status === "waiting");
  const completedTokens = queue.filter((t) => t.status === "completed" || t.status === "cancelled");

  return (
    <DashboardLayout
      title="Queue Management"
      description={`${format(new Date(), "EEEE, MMMM d, yyyy")}`}
      actions={
        <div className="flex gap-2">
          {/* New Patient Button */}
          <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient to Queue</DialogTitle>
                <DialogDescription>
                  Create a new patient and automatically add them to today's queue.
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
                      Create & Add to Queue
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Existing Patient Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Existing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Patient to Queue</DialogTitle>
                <DialogDescription>
                  Select a patient to add to today's queue. They will get the next token number.
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
                        <p>All patients are already in today's queue</p>
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
            disabled={waitingCount === 0 && !currentToken}
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Call Next Patient
          </Button>
        </div>
      }
    >
      {/* Two Column Layout: Sessions + Queue */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column: Session Manager */}
        <div className="lg:col-span-1">
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

        {/* Right Column: Queue */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
                    <p className="text-sm text-muted-foreground">Waiting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {currentToken ? `#${currentToken.token_number}` : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">Current</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!selectedSession ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarClock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Session</h3>
                <p className="text-muted-foreground mb-4">
                  Create or select a session to manage the queue
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : queue.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No patients in queue</h3>
                <p className="text-muted-foreground mb-4">
                  Add patients to the queue to get started
                </p>
                <Button onClick={() => setIsNewPatientDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              </CardContent>
            </Card>
          ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Patient */}
          {currentToken && (
            <Card className="lg:col-span-2 bg-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping"></div>
                  </div>
                  Now Serving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-success flex items-center justify-center text-success-foreground">
                      <span className="text-3xl font-bold">#{currentToken.token_number}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {currentToken.patient?.name}
                      </p>
                      <p className="text-muted-foreground">{currentToken.patient?.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMakePrescription}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Make Prescription
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleComplete(currentToken.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(currentToken.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Waiting List */}
          <Card>
            <CardHeader>
              <CardTitle>Waiting ({waitingTokens.length})</CardTitle>
              <CardDescription>Patients waiting to be called</CardDescription>
            </CardHeader>
            <CardContent>
              {waitingTokens.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No patients waiting
                </p>
              ) : (
                <div className="space-y-2">
                  {waitingTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        index === 0 && "bg-warning/5 border-warning/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            index === 0
                              ? "bg-warning text-warning-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          #{token.token_number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {token.patient?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {token.patient?.phone}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          Next
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed List */}
          <Card>
            <CardHeader>
              <CardTitle>Completed ({completedTokens.length})</CardTitle>
              <CardDescription>Patients seen today</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTokens.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No patients completed yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {completedTokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                          #{token.token_number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {token.patient?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {token.patient?.phone}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={token.status === "completed" ? "secondary" : "destructive"}
                      >
                        {token.status === "completed" ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Done</>
                        ) : (
                          <><XCircle className="mr-1 h-3 w-3" /> Cancelled</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
        </div>
      </div>
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
    </DashboardLayout>
  );
};

export default Queue;
