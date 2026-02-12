import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useVisits, VisitInsert } from "@/hooks/useVisits";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useQueue } from "@/hooks/useQueue";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Calendar,
  FileText,
  Clock,
  Pill,
  AlertTriangle,
  Activity,
  Plus,
  Loader2,
  UserPlus,
  StickyNote,
  Trash2,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { profile } = useProfile();
  const { visits, createVisit, isCreating } = useVisits(id);
  const { prescriptions } = usePrescriptions(id);
  const { addToQueue, isAdding } = useQueue();
  const queryClient = useQueryClient();

  const patient = patients.find(p => p.id === id);

  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitForm, setVisitForm] = useState<Partial<VisitInsert>>({
    symptoms: "",
    diagnosis: "",
    advice: "",
    fees: 0,
    payment_status: "paid",
  });
  const [newNote, setNewNote] = useState("");

  // Fetch patient notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["patient-notes", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("patient_notes")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Add note mutation
  const addNote = useMutation({
    mutationFn: async (note: string) => {
      if (!profile?.id || !id) throw new Error("Missing data");
      const { error } = await supabase
        .from("patient_notes")
        .insert({ patient_id: id, doctor_id: profile.id, note });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-notes", id] });
      setNewNote("");
      toast.success("Note added");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete note mutation
  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("patient_notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-notes", id] });
      toast.success("Note deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!patient) {
    return (
      <DashboardLayout title="Patient Not Found">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Patient not found or has been deleted.</p>
            <Button asChild>
              <Link to="/dashboard/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleCreateVisit = () => {
    if (!id) return;
    createVisit({
      patient_id: id,
      ...visitForm,
    });
    setIsVisitDialogOpen(false);
    setVisitForm({
      symptoms: "",
      diagnosis: "",
      advice: "",
      fees: 0,
      payment_status: "paid",
    });
  };

  const handleAddToQueue = () => {
    if (!id) return;
    addToQueue(id);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate(newNote.trim());
  };

  return (
    <DashboardLayout
      title="Patient Details"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/patients/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Visit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Visit</DialogTitle>
                <DialogDescription>
                  Record a new visit for {patient.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chief Complaints / Symptoms</Label>
                  <Textarea
                    placeholder="e.g., Fever for 3 days, headache..."
                    value={visitForm.symptoms || ""}
                    onChange={(e) => setVisitForm({ ...visitForm, symptoms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="e.g., Viral fever"
                    value={visitForm.diagnosis || ""}
                    onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advice</Label>
                  <Textarea
                    placeholder="Treatment advice..."
                    value={visitForm.advice || ""}
                    onChange={(e) => setVisitForm({ ...visitForm, advice: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fees (৳)</Label>
                    <Input
                      type="number"
                      value={visitForm.fees || 0}
                      onChange={(e) => setVisitForm({ ...visitForm, fees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={visitForm.payment_status || "paid"}
                      onValueChange={(v) => setVisitForm({ ...visitForm, payment_status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="due">Due</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateVisit} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <>Record Visit</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/dashboard/patients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            {patient.age && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{patient.age} years old</span>
              </div>
            )}
            {patient.gender && (
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{patient.gender}</span>
              </div>
            )}
            {patient.blood_group && (
              <Badge variant="outline" className="text-destructive border-destructive">
                {patient.blood_group}
              </Badge>
            )}
            
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Chronic Conditions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.chronic_conditions.map((condition, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.address && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Address</p>
                <p>{patient.address}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Registered: {format(new Date(patient.created_at), "dd MMM yyyy")}
            </div>
          </CardContent>
        </Card>

        {/* Visit History, Prescriptions & Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>{visits.length} visits recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visits">
              <TabsList>
                <TabsTrigger value="visits">
                  <Clock className="mr-2 h-4 w-4" />
                  Visits ({visits.length})
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <FileText className="mr-2 h-4 w-4" />
                  Prescriptions ({prescriptions.length})
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <StickyNote className="mr-2 h-4 w-4" />
                  Notes ({notes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visits" className="mt-4">
                {visits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No visits recorded yet</p>
                    <Button variant="link" onClick={() => setIsVisitDialogOpen(true)}>
                      Record first visit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0"
                      >
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {format(new Date(visit.visit_date), "dd MMM yyyy")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(visit.visit_date), "hh:mm a")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {visit.fees && visit.fees > 0 && (
                                <Badge variant="outline">৳{visit.fees}</Badge>
                              )}
                              <Badge
                                variant={visit.payment_status === "paid" ? "secondary" : "destructive"}
                              >
                                {visit.payment_status || "paid"}
                              </Badge>
                            </div>
                          </div>
                          {visit.symptoms && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">Symptoms: </span>
                              <span className="text-sm text-muted-foreground">{visit.symptoms}</span>
                            </div>
                          )}
                          {visit.diagnosis && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">Diagnosis: </span>
                              <span className="text-sm text-muted-foreground">{visit.diagnosis}</span>
                            </div>
                          )}
                          {visit.advice && (
                            <div>
                              <span className="text-sm font-medium">Advice: </span>
                              <span className="text-sm text-muted-foreground">{visit.advice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No prescriptions yet</p>
                    <Button variant="link" asChild>
                      <Link to="/dashboard/prescriptions">Create prescription</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => (
                      <Card key={rx.id} className="bg-muted/30">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {format(new Date(rx.created_at), "dd MMM yyyy")}
                              </span>
                            </div>
                            <Badge variant="outline">
                              {rx.medicines.length} medicine{rx.medicines.length !== 1 && "s"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {rx.medicines.slice(0, 3).map((med: any, i: number) => (
                              <p key={i} className="text-sm text-muted-foreground">
                                • {med.name} - {med.dosage} ({med.duration})
                              </p>
                            ))}
                            {rx.medicines.length > 3 && (
                              <p className="text-sm text-muted-foreground">
                                +{rx.medicines.length - 3} more
                              </p>
                            )}
                          </div>
                          {rx.next_visit_date && (
                            <p className="text-sm text-primary mt-2">
                              Next visit: {format(new Date(rx.next_visit_date), "dd MMM yyyy")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                {/* Add Note */}
                <div className="flex gap-2 mb-4">
                  <Textarea
                    placeholder="Write an internal note about this patient..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || addNote.isPending}
                  size="sm"
                  className="mb-4"
                >
                  {addNote.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Add Note
                </Button>

                {/* Notes List */}
                {notesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet</p>
                    <p className="text-xs mt-1">Add internal notes about this patient</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note: any) => (
                      <div key={note.id} className="bg-muted/30 rounded-lg p-4 group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm whitespace-pre-wrap flex-1">{note.note}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => deleteNote.mutate(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.created_at), "dd MMM yyyy, hh:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
