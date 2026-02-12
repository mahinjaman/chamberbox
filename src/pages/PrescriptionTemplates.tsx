import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { usePrescriptions, PrescriptionMedicine, PrescriptionInvestigation } from "@/hooks/usePrescriptions";
import { useMedicines } from "@/hooks/useMedicines";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { InvestigationSelector } from "@/components/prescription/InvestigationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, FileText, Pill, Search, BookTemplate, X } from "lucide-react";
import { toast } from "sonner";

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
  "প্রচুর পানি পান করুন",
  "বিশ্রাম নিন",
  "ঝাল খাবার এড়িয়ে চলুন",
  "সমস্যা থাকলে ফলো-আপে আসুন",
  "খাবারের পরে ওষুধ খান",
  "ঠান্ডা পানীয় এড়িয়ে চলুন",
];

export default function PrescriptionTemplates() {
  const { language } = useLanguage();
  const { templates, saveTemplate, deleteTemplate, isLoading } = usePrescriptions();
  const { searchMedicines, createMedicine } = useMedicines();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateAdvice, setNewTemplateAdvice] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState<PrescriptionInvestigation[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customMedicineName, setCustomMedicineName] = useState("");

  const medicineResults = searchMedicines(medicineSearch);

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleAddCustomMedicine = async () => {
    if (!customMedicineName.trim()) return;
    const med = await createMedicine({
      brand_name: customMedicineName.trim(),
      generic_name: customMedicineName.trim(),
    });
    addMedicine(med);
    setCustomMedicineName("");
    setShowAddCustom(false);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error(language === "bn" ? "টেমপ্লেট নাম দিন" : "Enter template name");
      return;
    }
    if (selectedMedicines.length === 0) {
      toast.error(language === "bn" ? "অন্তত একটি ওষুধ যোগ করুন" : "Add at least one medicine");
      return;
    }

    saveTemplate({
      name: newTemplateName,
      medicines: selectedMedicines,
      advice: newTemplateAdvice || undefined,
    });

    resetForm();
  };

  const resetForm = () => {
    setIsCreateOpen(false);
    setNewTemplateName("");
    setNewTemplateAdvice("");
    setSelectedMedicines([]);
    setSelectedInvestigations([]);
    setMedicineSearch("");
    setShowAddCustom(false);
    setCustomMedicineName("");
  };

  const handleDeleteTemplate = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout
      title={language === "bn" ? "প্রেসক্রিপশন টেমপ্লেট" : "Prescription Templates"}
      description={language === "bn" ? "পুনঃব্যবহারযোগ্য টেমপ্লেট তৈরি ও পরিচালনা করুন" : "Create and manage reusable templates"}
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "bn" ? "নতুন টেমপ্লেট" : "New Template"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "টেমপ্লেট খুঁজুন..." : "Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 bg-muted rounded w-1/2"></div></CardHeader>
                <CardContent><div className="space-y-2"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></div></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookTemplate className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery
                  ? (language === "bn" ? "কোনো টেমপ্লেট পাওয়া যায়নি" : "No templates found")
                  : (language === "bn" ? "কোনো টেমপ্লেট নেই" : "No templates yet")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "bn" ? "দ্রুত প্রেসক্রিপশন তৈরির জন্য টেমপ্লেট সংরক্ষণ করুন" : "Save templates for quick prescription creation"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {template.name}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Pill className="w-3 h-3" />
                      {template.medicines.length} {language === "bn" ? "ওষুধ" : "medicines"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.medicines.slice(0, 3).map((med, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{med.name}</span>
                      ))}
                      {template.medicines.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{template.medicines.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  {template.advice && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.advice}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === "bn" ? "নতুন টেমপ্লেট তৈরি করুন" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label>{language === "bn" ? "টেমপ্লেট নাম" : "Template Name"}</Label>
              <Input
                placeholder={language === "bn" ? "যেমন: জ্বর ও সর্দি" : "e.g., Fever & Cold"}
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>

            {/* Medicine Search */}
            <div className="space-y-2">
              <Label>{language === "bn" ? "ওষুধ খুঁজুন" : "Search Medicines"}</Label>
              <div className="relative">
                <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicine (Napa, Seclo...)"
                  className="pl-10"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                />
              </div>
              {medicineSearch && medicineSearch.length >= 2 && medicineResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {medicineResults.map((m) => (
                    <button
                      key={m.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center"
                      onClick={() => addMedicine(m)}
                    >
                      <div>
                        <span className="font-medium">{m.brand_name}</span>
                        {m.strength && <span className="text-sm text-muted-foreground ml-1">{m.strength}</span>}
                      </div>
                      <Badge variant="outline">{m.generic_name}</Badge>
                    </button>
                  ))}
                </div>
              )}
              {medicineSearch && medicineSearch.length >= 2 && medicineResults.length === 0 && (
                <div className="border rounded-md p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-2">"{medicineSearch}" পাওয়া যায়নি</p>
                  {!showAddCustom ? (
                    <Button variant="outline" size="sm" onClick={() => { setShowAddCustom(true); setCustomMedicineName(medicineSearch); }}>
                      <Plus className="mr-1 h-3 w-3" />
                      কাস্টম ওষুধ হিসেবে যোগ করুন
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={customMedicineName} onChange={(e) => setCustomMedicineName(e.target.value)} placeholder="Medicine name" className="flex-1" />
                      <Button size="sm" onClick={handleAddCustomMedicine}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddCustom(false)}><X className="h-3 w-3" /></Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Medicines */}
            <div className="space-y-2">
              <Label>{language === "bn" ? "নির্বাচিত ওষুধ" : "Selected Medicines"} ({selectedMedicines.length})</Label>
              {selectedMedicines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {language === "bn" ? "উপরে থেকে ওষুধ খুঁজে যোগ করুন" : "Search and add medicines above"}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMedicines.map((med, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="font-medium text-sm">{med.name}</div>
                            <div className="flex gap-2 flex-wrap">
                              <Input
                                className="w-24 h-8 text-sm"
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) => updateMedicine(index, { dosage: e.target.value })}
                              />
                              <Select value={med.duration} onValueChange={(v) => updateMedicine(index, { duration: v })}>
                                <SelectTrigger className="w-28 h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DURATION_PRESETS.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                      {language === "bn" ? d.label_bn : d.label_en}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                className="flex-1 min-w-[100px] h-8 text-sm"
                                placeholder="Instructions"
                                value={med.instructions || ""}
                                onChange={(e) => updateMedicine(index, { instructions: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMedicine(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Investigations */}
            <InvestigationSelector
              selected={selectedInvestigations}
              onSelect={setSelectedInvestigations}
              language="english"
            />

            {/* Advice */}
            <div className="space-y-2">
              <Label>{language === "bn" ? "উপদেশ (ঐচ্ছিক)" : "Advice (Optional)"}</Label>
              <Textarea
                placeholder={language === "bn" ? "সাধারণ উপদেশ..." : "General advice..."}
                value={newTemplateAdvice}
                onChange={(e) => setNewTemplateAdvice(e.target.value)}
                rows={2}
              />
              <div className="flex flex-wrap gap-1">
                {ADVICE_SHORTCUTS.map((shortcut) => (
                  <Button
                    key={shortcut}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setNewTemplateAdvice(newTemplateAdvice ? `${newTemplateAdvice}\n${shortcut}` : shortcut)}
                  >
                    {shortcut}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={resetForm} className="flex-1">
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim() || selectedMedicines.length === 0} className="flex-1">
              {language === "bn" ? "সংরক্ষণ করুন" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "bn" ? "টেমপ্লেট মুছে ফেলুন?" : "Delete Template?"}</AlertDialogTitle>
            <AlertDialogDescription>{language === "bn" ? "এই টেমপ্লেটটি স্থায়ীভাবে মুছে ফেলা হবে।" : "This template will be permanently deleted."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "bn" ? "বাতিল" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {language === "bn" ? "মুছে ফেলুন" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
