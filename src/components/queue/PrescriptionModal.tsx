import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrescriptions, PrescriptionMedicine, PrescriptionInvestigation } from "@/hooks/usePrescriptions";
import { useMedicines } from "@/hooks/useMedicines";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { InvestigationSelector } from "@/components/prescription/InvestigationSelector";
import {
  Search,
  Trash2,
  Save,
  Printer,
  Languages,
  Copy,
  X,
  Loader2,
  Pill,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { format } from "date-fns";

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

interface Patient {
  id: string;
  name: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  blood_group?: string | null;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess?: (prescriptionId: string) => void;
}

export const PrescriptionModal = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: PrescriptionModalProps) => {
  const { profile } = useProfile();
  const { templates, createPrescription, isCreating } = usePrescriptions();
  const { searchMedicines } = useMedicines();
  const { checkLimit, isExpired } = useFeatureAccess();
  const prescriptionLimit = checkLimit("prescriptions");

  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState<PrescriptionInvestigation[]>([]);
  const [advice, setAdvice] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [language, setLanguage] = useState<"english" | "bangla">("english");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const searchResults = searchMedicines(medicineSearch);

  const addMedicine = (med: {
    brand_name: string;
    brand_name_bn: string | null;
    default_dosage: string | null;
    strength: string | null;
  }) => {
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

  const applyTemplate = (template: {
    medicines: PrescriptionMedicine[];
    advice: string | null;
  }) => {
    setSelectedMedicines(template.medicines);
    if (template.advice) setAdvice(template.advice);
  };

  const handleCreatePrescription = () => {
    if (!patient || selectedMedicines.length === 0) return;

    createPrescription(
      {
        patient_id: patient.id,
        medicines: selectedMedicines,
        investigations: selectedInvestigations,
        advice: advice || undefined,
        next_visit_date: nextVisit || undefined,
        language,
      },
      {
        onSuccess: (data) => {
          resetForm();
          onClose();
          if (data?.id) {
            onSuccess?.(data.id);
          }
        },
      }
    );
  };

  const resetForm = () => {
    setSelectedMedicines([]);
    setSelectedInvestigations([]);
    setAdvice("");
    setNextVisit("");
    setSymptoms("");
    setDiagnosis("");
    setMedicineSearch("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!patient) return null;

  // If prescription limit reached, show upgrade prompt
  if (!prescriptionLimit.withinLimit) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              For {patient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isExpired ? "Subscription Expired" : "Prescription Limit Reached"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md text-sm">
              {prescriptionLimit.message}
            </p>
            <Button asChild>
              <Link to="/dashboard/settings">
                <Crown className="w-4 h-4 mr-2" />
                {isExpired ? "Renew Subscription" : "Upgrade Plan"}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
          <DialogDescription>
            Create a digital prescription for {patient.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Builder */}
          <div className="space-y-4">
            {/* Patient Info (Auto-filled) */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-3">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.phone}
                    {patient.age && ` • ${patient.age} yrs`}
                    {patient.gender && ` • ${patient.gender}`}
                    {patient.blood_group && ` • ${patient.blood_group}`}
                  </p>
                </div>
              </CardContent>
            </Card>

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
                  onClick={() =>
                    setLanguage(language === "english" ? "bangla" : "english")
                  }
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
                        {m.strength && (
                          <span className="text-sm text-muted-foreground ml-1">
                            {m.strength}
                          </span>
                        )}
                        {language === "bangla" && m.brand_name_bn && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({m.brand_name_bn})
                          </span>
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
                          {language === "bangla" && med.name_bn
                            ? med.name_bn
                            : med.name}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Input
                            className="w-24"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) =>
                              updateMedicine(index, { dosage: e.target.value })
                            }
                          />
                          <Select
                            value={med.duration}
                            onValueChange={(v) =>
                              updateMedicine(index, { duration: v })
                            }
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
                            className="flex-1 min-w-[120px]"
                            placeholder="Special instructions"
                            value={med.instructions || ""}
                            onChange={(e) =>
                              updateMedicine(index, { instructions: e.target.value })
                            }
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
                    onClick={() =>
                      setAdvice(advice ? `${advice}\n${shortcut}` : shortcut)
                    }
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
              <h2 className="text-xl font-bold">
                {profile?.full_name || "Doctor Name"}
              </h2>
              <p className="text-sm text-gray-600">{profile?.specialization}</p>
              <p className="text-sm text-gray-600">
                BMDC Reg: {profile?.bmdc_number}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {profile?.chamber_address}
              </p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Patient: </span>
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date: </span>
                  {format(new Date(), "dd/MM/yyyy")}
                </div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <div>
                  {patient.age && (
                    <>
                      <span className="text-gray-500">Age: </span>
                      <span>{patient.age} yrs</span>
                    </>
                  )}
                </div>
                {patient.gender && (
                  <div>
                    <span className="text-gray-500">Gender: </span>
                    <span className="capitalize">{patient.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {(symptoms || diagnosis) && (
              <div className="mb-4 pb-4 border-b text-sm">
                {symptoms && (
                  <div>
                    <span className="text-muted-foreground">C/C: </span>
                    {symptoms}
                  </div>
                )}
                {diagnosis && (
                  <div>
                    <span className="text-muted-foreground">Diagnosis: </span>
                    {diagnosis}
                  </div>
                )}
              </div>
            )}

            {/* Investigations Preview */}
            {selectedInvestigations.length > 0 && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-bold mb-2">🔬 Investigations</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedInvestigations.map((inv, i) => (
                    <span
                      key={i}
                      className="bg-muted px-2 py-1 rounded text-xs"
                    >
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
                      <span className="font-medium">
                        {language === "bangla" && med.name_bn
                          ? med.name_bn
                          : med.name}
                      </span>
                      <div className="ml-5 text-muted-foreground">
                        {med.dosage} — {med.duration}
                        {med.instructions && ` (${med.instructions})`}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No medicines added yet
                </p>
              )}
            </div>

            {advice && (
              <div className="mb-4 pb-4 border-t pt-4">
                <h3 className="font-bold mb-2">Advice</h3>
                <p className="text-sm whitespace-pre-line">{advice}</p>
              </div>
            )}

            {nextVisit && (
              <div className="text-sm border-t pt-4">
                <span className="text-gray-500">Next Visit: </span>
                {format(new Date(nextVisit), "dd/MM/yyyy")}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleCreatePrescription}
              disabled={selectedMedicines.length === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Prescription
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
