import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrescriptions, PrescriptionMedicine } from "@/hooks/usePrescriptions";
import { useMedicines } from "@/hooks/useMedicines";
import { usePatients } from "@/hooks/usePatients";
import { useProfile } from "@/hooks/useProfile";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Printer,
  Languages,
  Copy,
  X,
  Loader2,
  Pill,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month"];
const ADVICE_SHORTCUTS = [
  "Drink plenty of water",
  "Take rest",
  "Avoid spicy food",
  "Come for follow-up if symptoms persist",
  "Take medicines after meals",
  "Avoid cold drinks",
];

const Prescriptions = () => {
  const { profile } = useProfile();
  const { patients } = usePatients();
  const { prescriptions, templates, createPrescription, saveTemplate, isCreating } = usePrescriptions();
  const { medicines, searchMedicines } = useMedicines();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientSearch, setPatientSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [advice, setAdvice] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [language, setLanguage] = useState<"english" | "bangla">("english");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const searchResults = searchMedicines(medicineSearch);

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
      advice: advice || undefined,
      next_visit_date: nextVisit || undefined,
      language,
    });

    // Reset form
    setSelectedPatientId("");
    setSelectedMedicines([]);
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
    <DashboardLayout
      title="Prescriptions"
      description="Create and manage digital prescriptions"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
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
                  <div className="flex items-center justify-between">
                    <Label>Medicines</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLanguage(language === "english" ? "bangla" : "english")}
                    >
                      <Languages className="mr-1 h-4 w-4" />
                      {language === "english" ? "EN" : "বাং"}
                    </Button>
                  </div>
                  <div className="relative">
                    <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medicine (Napa, Seclo...)"
                      className="pl-10"
                      value={medicineSearch}
                      onChange={(e) => setMedicineSearch(e.target.value)}
                    />
                  </div>
                  {medicineSearch && searchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
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
                    </div>
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
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
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
                          <Copy className="mr-1 h-3 w-3" />
                          {t.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Preview */}
              <div className="border rounded-lg p-6 bg-white text-black print:border-0">
                <div className="text-center mb-6 border-b pb-4">
                  <h2 className="text-xl font-bold">{profile?.full_name || "Doctor Name"}</h2>
                  <p className="text-sm text-gray-600">{profile?.specialization}</p>
                  <p className="text-sm text-gray-600">BMDC Reg: {profile?.bmdc_number}</p>
                  <p className="text-xs text-gray-500 mt-1">{profile?.chamber_address}</p>
                </div>

                {selectedPatient && (
                  <div className="mb-4 pb-4 border-b">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Patient: </span>
                        <span className="font-medium">{selectedPatient.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date: </span>
                        {format(new Date(), "dd/MM/yyyy")}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      {selectedPatient.age && <span>Age: {selectedPatient.age} yrs</span>}
                      {selectedPatient.gender && <span>Gender: {selectedPatient.gender}</span>}
                    </div>
                  </div>
                )}

                {(symptoms || diagnosis) && (
                  <div className="mb-4 text-sm">
                    {symptoms && <p><span className="font-medium">C/C:</span> {symptoms}</p>}
                    {diagnosis && <p><span className="font-medium">Diagnosis:</span> {diagnosis}</p>}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <span className="text-2xl mr-2">℞</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedMedicines.map((med, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div>
                          <span className="font-medium">{i + 1}. </span>
                          {language === "bangla" && med.name_bn ? med.name_bn : med.name}
                          {med.instructions && (
                            <span className="text-gray-500 italic ml-2">({med.instructions})</span>
                          )}
                        </div>
                        <div className="text-right text-gray-600">
                          <div>{med.dosage}</div>
                          <div className="text-xs">{med.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {advice && (
                  <div className="mb-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-1">Advice:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{advice}</p>
                  </div>
                )}

                {nextVisit && (
                  <div className="text-sm text-gray-600">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Next visit: {format(new Date(nextVisit), "dd/MM/yyyy")}
                  </div>
                )}

                <div className="mt-8 pt-4 border-t text-right">
                  <div className="inline-block border-t border-gray-400 pt-1">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">Signature</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(true)}
                  disabled={selectedMedicines.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Template
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
              <Button
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
      }
    >
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

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Prescriptions</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
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
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prescriptions.map((p) => (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{p.patient?.name || "Unknown"}</CardTitle>
                        <CardDescription>{p.patient?.phone}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(p.created_at), "dd MMM")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Copy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No templates yet. Save a prescription as template to reuse it quickly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription>
                      {t.medicines.length} medicine{t.medicines.length !== 1 && "s"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      {t.medicines.slice(0, 3).map((m, i) => (
                        <p key={i} className="text-sm text-muted-foreground truncate">
                          • {m.name}
                        </p>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        applyTemplate(t);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Prescriptions;
