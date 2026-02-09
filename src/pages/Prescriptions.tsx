import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { usePrescriptions, PrescriptionMedicine, Prescription, PrescriptionInvestigation } from "@/hooks/usePrescriptions";
import { useMedicines } from "@/hooks/useMedicines";
import { usePatients } from "@/hooks/usePatients";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { PrescriptionView } from "@/components/prescription/PrescriptionView";
import { InvestigationSelector } from "@/components/prescription/InvestigationSelector";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Printer,
  Languages,
  X,
  Loader2,
  Pill,
  Calendar,
  Eye,
  Lock,
  Crown
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = [
  { value: "3 days", label_en: "3 days", label_bn: "৩ দিন" },
  { value: "5 days", label_en: "5 days", label_bn: "৫ দিন" },
  { value: "7 days", label_en: "7 days", label_bn: "৭ দিন" },
  { value: "10 days", label_en: "10 days", label_bn: "১০ দিন" },
  { value: "14 days", label_en: "14 days", label_bn: "১৪ দিন" },
  { value: "1 month", label_en: "1 month", label_bn: "১ মাস" },
  { value: "continue", label_en: "Continue", label_bn: "চলবে" },
];
const ADVICE_SHORTCUTS = [
  "Drink plenty of water",
  "Take rest",
  "Avoid spicy food",
  "Come for follow-up if symptoms persist",
  "Take medicines after meals",
  "Avoid cold drinks",
];

// Helper to get duration display label
const getDurationLabel = (value: string, lang: "english" | "bangla") => {
  const preset = DURATION_PRESETS.find((d) => d.value === value);
  if (preset) {
    return lang === "bangla" ? preset.label_bn : preset.label_en;
  }
  return value; // fallback to raw value for custom durations
};

const PRESCRIPTIONS_PER_PAGE = 9;

const Prescriptions = () => {
  const { profile } = useProfile();
  const { patients } = usePatients();
  const { prescriptions, templates, createPrescription, saveTemplate, deletePrescription, isCreating, isDeleting } = usePrescriptions();
  const { medicines, searchMedicines, createMedicine, isCreating: isCreatingMedicine } = useMedicines();
  const { checkLimit, isExpired } = useFeatureAccess();
  const prescriptionLimit = checkLimit("prescriptions");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientSearch, setPatientSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState<PrescriptionInvestigation[]>([]);
  const [advice, setAdvice] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [language, setLanguage] = useState<"english" | "bangla">("english");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null);
  const [showAddMedicineForm, setShowAddMedicineForm] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedGeneric, setNewMedGeneric] = useState("");
  const [newMedStrength, setNewMedStrength] = useState("");

  // Search and filter state for prescriptions list
  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const searchResults = searchMedicines(medicineSearch);

  // Filter prescriptions by search and date
  const filteredPrescriptions = prescriptions.filter((p) => {
    // Search by patient name or phone
    const searchLower = prescriptionSearch.toLowerCase();
    const matchesSearch = !prescriptionSearch || 
      (p.patient?.name?.toLowerCase().includes(searchLower)) ||
      (p.patient?.phone?.includes(prescriptionSearch));
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const prescDate = new Date(p.created_at);
      const today = new Date();
      
      if (dateFilter === "today") {
        matchesDate = prescDate.toDateString() === today.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = prescDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = prescDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalPrescriptions = filteredPrescriptions.length;
  const totalPages = Math.ceil(totalPrescriptions / PRESCRIPTIONS_PER_PAGE);
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * PRESCRIPTIONS_PER_PAGE,
    currentPage * PRESCRIPTIONS_PER_PAGE
  );

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setPrescriptionSearch(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const addMedicine = (med: { brand_name: string; brand_name_bn: string | null; default_dosage: string | null; strength: string | null }) => {
    setSelectedMedicines([
      ...selectedMedicines,
      {
        name: `${med.brand_name}${med.strength ? ` ${med.strength}` : ""}`,
        name_bn: med.brand_name_bn || undefined,
        dosage: med.default_dosage || "1+0+1",
        duration: "7 days",
        instructions: "",
      },
    ]);
    setMedicineSearch("");
  };

  const updateMedicine = (index: number, updates: Partial<PrescriptionMedicine>) => {
    const updated = [...selectedMedicines];
    updated[index] = { ...updated[index], ...updates };
    setSelectedMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate({
      name: templateName,
      medicines: selectedMedicines,
      advice,
    });
    setShowTemplateDialog(false);
    setTemplateName("");
  };

  const applyTemplate = (template: { medicines: PrescriptionMedicine[]; advice: string | null }) => {
    setSelectedMedicines(template.medicines);
    if (template.advice) setAdvice(template.advice);
  };

  const handleCreatePrescription = () => {
    if (!selectedPatientId || selectedMedicines.length === 0) return;

    createPrescription({
      patient_id: selectedPatientId,
      medicines: selectedMedicines,
      investigations: selectedInvestigations,
      advice: advice || undefined,
      next_visit_date: nextVisit || undefined,
      language,
    });

    // Reset form
    setSelectedPatientId("");
    setSelectedMedicines([]);
    setSelectedInvestigations([]);
    setAdvice("");
    setNextVisit("");
    setSymptoms("");
    setDiagnosis("");
    setIsDialogOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <TooltipProvider>
    <DashboardLayout
      title="Prescriptions"
      description="Create and manage digital prescriptions"
      actions={
        prescriptionLimit.withinLimit ? (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled className="opacity-60">
                <Lock className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{prescriptionLimit.message}</p>
              <Link to="/dashboard/settings" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                <Crown className="w-3 h-3" /> Upgrade Plan
              </Link>
            </TooltipContent>
          </Tooltip>
        )
      }
    >
      {/* New Prescription Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create a digital prescription for your patient
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Side - Builder */}
            <div className="space-y-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    className="pl-10"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                {patientSearch && !selectedPatient && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {filteredPatients.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setPatientSearch("");
                        }}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-sm text-muted-foreground">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPatient && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.phone} • {selectedPatient.age && `${selectedPatient.age} yrs`} • {selectedPatient.gender}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPatientId("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Symptoms & Diagnosis */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Symptoms (Chief Complaints)</Label>
                  <Input
                    placeholder="e.g., Fever, headache, cough"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="e.g., Viral fever"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
              </div>

              {/* Medicine Search */}
              <div className="space-y-2">
                  <Label>Medicines</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medicine (Napa, Seclo...)"
                    className="pl-10"
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                  />
                </div>
                {medicineSearch && medicineSearch.length >= 2 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {searchResults.map((m) => (
                      <button
                        key={m.id}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center"
                        onClick={() => addMedicine(m)}
                      >
                        <div>
                          <span className="font-medium">{m.brand_name}</span>
                          {m.strength && <span className="text-sm text-muted-foreground ml-1">{m.strength}</span>}
                          {language === "bangla" && m.brand_name_bn && (
                            <span className="text-sm text-muted-foreground ml-2">({m.brand_name_bn})</span>
                          )}
                        </div>
                        <Badge variant="outline">{m.generic_name}</Badge>
                      </button>
                    ))}
                    {/* Add new medicine option */}
                    {!showAddMedicineForm && (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-primary/5 border-t flex items-center gap-2 text-primary"
                        onClick={() => {
                          setShowAddMedicineForm(true);
                          setNewMedName(medicineSearch);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Add "{medicineSearch}" as new medicine</span>
                      </button>
                    )}
                  </div>
                )}
                {/* Inline Add Medicine Form */}
                {showAddMedicineForm && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="py-3 space-y-2">
                      <p className="text-sm font-medium">Add New Medicine</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="Brand Name *"
                          value={newMedName}
                          onChange={(e) => setNewMedName(e.target.value)}
                        />
                        <Input
                          placeholder="Generic/Category *"
                          value={newMedGeneric}
                          onChange={(e) => setNewMedGeneric(e.target.value)}
                        />
                        <Input
                          placeholder="Strength (e.g. 500mg)"
                          value={newMedStrength}
                          onChange={(e) => setNewMedStrength(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddMedicineForm(false);
                            setNewMedName("");
                            setNewMedGeneric("");
                            setNewMedStrength("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={!newMedName.trim() || !newMedGeneric.trim() || isCreatingMedicine}
                          onClick={async () => {
                            const created = await createMedicine({
                              brand_name: newMedName.trim(),
                              generic_name: newMedGeneric.trim(),
                              strength: newMedStrength.trim() || undefined,
                            });
                            if (created) {
                              addMedicine(created);
                            }
                            setShowAddMedicineForm(false);
                            setNewMedName("");
                            setNewMedGeneric("");
                            setNewMedStrength("");
                          }}
                        >
                          {isCreatingMedicine && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Add & Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Selected Medicines */}
              <div className="space-y-2">
                {selectedMedicines.map((med, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="font-medium">
                            {language === "bangla" && med.name_bn ? med.name_bn : med.name}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              className="w-24"
                              placeholder="Dosage"
                              value={med.dosage}
                              onChange={(e) => updateMedicine(index, { dosage: e.target.value })}
                            />
                            <Select
                              value={med.duration}
                              onValueChange={(v) => updateMedicine(index, { duration: v })}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DURATION_PRESETS.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>
                                    {language === "bangla" ? d.label_bn : d.label_en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              className="flex-1"
                              placeholder="Special instructions"
                              value={med.instructions || ""}
                              onChange={(e) => updateMedicine(index, { instructions: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMedicine(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {selectedMedicines.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">
                    Search and add medicines above
                  </p>
                )}
              </div>

              {/* Investigations */}
              <InvestigationSelector
                selected={selectedInvestigations}
                onSelect={setSelectedInvestigations}
                language={language}
              />

              {/* Advice */}
              <div className="space-y-2">
                <Label>Advice</Label>
                <Textarea
                  placeholder="General advice for the patient..."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  rows={2}
                />
                <div className="flex flex-wrap gap-1">
                  {ADVICE_SHORTCUTS.map((shortcut) => (
                    <Button
                      key={shortcut}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setAdvice(advice ? `${advice}\n${shortcut}` : shortcut)}
                    >
                      {shortcut}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Next Visit */}
              <div className="space-y-2">
                <Label>Next Visit Date</Label>
                <Input
                  type="date"
                  value={nextVisit}
                  onChange={(e) => setNextVisit(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((t) => (
                      <Button
                        key={t.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(t)}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Preview */}
            <div className="border rounded-lg p-6 bg-card text-card-foreground print:border-0 print:bg-white print:text-black">
              <div className="text-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold">{profile?.full_name || "Doctor Name"}</h2>
                <p className="text-sm text-muted-foreground">{profile?.specialization}</p>
                <p className="text-sm text-muted-foreground">BMDC Reg: {profile?.bmdc_number}</p>
                <p className="text-xs text-muted-foreground mt-1">{profile?.chamber_address}</p>
              </div>

              {selectedPatient && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <div><span className="text-muted-foreground">Patient: </span><span className="font-medium">{selectedPatient.name}</span></div>
                    <div><span className="text-muted-foreground">Date: </span>{format(new Date(), "dd/MM/yyyy")}</div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <div>{selectedPatient.age && <><span className="text-muted-foreground">Age: </span><span>{selectedPatient.age} yrs</span></>}</div>
                    {selectedPatient.gender && <div><span className="text-muted-foreground">Gender: </span><span className="capitalize">{selectedPatient.gender}</span></div>}
                  </div>
                </div>
              )}

              {(symptoms || diagnosis) && (
                <div className="mb-4 pb-4 border-b text-sm">
                  {symptoms && <div><span className="text-muted-foreground">C/C: </span>{symptoms}</div>}
                  {diagnosis && <div><span className="text-muted-foreground">Diagnosis: </span>{diagnosis}</div>}
                </div>
              )}

              {selectedInvestigations.length > 0 && (
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-bold mb-2">🔬 Investigations</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedInvestigations.map((inv, i) => (
                      <span key={i} className="bg-muted px-2 py-1 rounded text-xs">
                        {language === "bangla" && inv.name_bn ? inv.name_bn : inv.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">℞</span> Medicines
                </h3>
                {selectedMedicines.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedMedicines.map((med, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{language === "bangla" && med.name_bn ? med.name_bn : med.name}</span>
                        <div className="ml-5 text-muted-foreground">
                          {med.dosage} — {getDurationLabel(med.duration, language)}
                          {med.instructions && <span className="italic"> ({med.instructions})</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No medicines added yet</p>
                )}
              </div>

              {advice && (
                <div className="mb-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Advice:</h4>
                  <p className="text-sm whitespace-pre-line">{advice}</p>
                </div>
              )}

              {nextVisit && (
                <div className="pt-4 border-t">
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Visit:</span>
                    <span className="font-medium">{format(new Date(nextVisit), "PPP")}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplateDialog(true)}
              disabled={selectedMedicines.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreatePrescription}
              disabled={!selectedPatientId || selectedMedicines.length === 0 || isCreating}
            >
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" /> Create Prescription</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Save Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this prescription as a template for quick reuse
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Common Cold, Hypertension..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or phone..."
              value={prescriptionSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center text-sm text-muted-foreground ml-auto">
            Total: <span className="font-semibold text-foreground ml-1">{totalPrescriptions}</span> prescriptions
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No prescriptions yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Create your first digital prescription with bilingual support and smart medicine search.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Prescription
              </Button>
            </CardContent>
          </Card>
        ) : totalPrescriptions === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No prescriptions found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPrescriptions.map((p) => (
                <Card 
                  key={p.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewPrescription(p)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{p.patient?.name || "Unknown"}</CardTitle>
                        <CardDescription>
                          {p.patient?.phone}
                          {p.patient?.age && ` • ${p.patient.age} yrs`}
                          {p.patient?.gender && ` • ${p.patient.gender}`}
                          {p.patient?.blood_group && ` • ${p.patient.blood_group}`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(p.created_at), "dd MMM")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-3">
                      {(p.medicines || []).slice(0, 3).map((m, i) => (
                        <p key={i} className="text-sm text-muted-foreground truncate">
                          • {m.name}
                        </p>
                      ))}
                      {p.medicines.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{p.medicines.length - 3} more
                        </p>
                      )}
                    </div>
                    {(p.investigations || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.investigations || []).slice(0, 2).map((inv, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {inv.name.length > 15 ? inv.name.slice(0, 15) + "..." : inv.name}
                          </Badge>
                        ))}
                        {(p.investigations || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(p.investigations || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 py-2.5 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewPrescription(p);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrescriptionToDelete(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PRESCRIPTIONS_PER_PAGE + 1}-{Math.min(currentPage * PRESCRIPTIONS_PER_PAGE, totalPrescriptions)} of {totalPrescriptions}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Prescription View Modal */}
      <PrescriptionView
        prescription={viewPrescription}
        isOpen={!!viewPrescription}
        onClose={() => setViewPrescription(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!prescriptionToDelete} onOpenChange={(open) => !open && setPrescriptionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prescription record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (prescriptionToDelete) {
                  deletePrescription(prescriptionToDelete);
                  setPrescriptionToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
    </TooltipProvider>
  );
};

export default Prescriptions;
