import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { usePrescriptions, PrescriptionMedicine } from "@/hooks/usePrescriptions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Trash2, FileText, Pill, Search, BookTemplate } from "lucide-react";
import { toast } from "sonner";

export default function PrescriptionTemplates() {
  const { language } = useLanguage();
  const { templates, saveTemplate, deleteTemplate, isLoading } = usePrescriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New template form state
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateAdvice, setNewTemplateAdvice] = useState("");
  const [newMedicines, setNewMedicines] = useState<PrescriptionMedicine[]>([
    { name: "", dosage: "", duration: "", instructions: "" }
  ]);

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMedicine = () => {
    setNewMedicines([...newMedicines, { name: "", dosage: "", duration: "", instructions: "" }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setNewMedicines(newMedicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const updated = [...newMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setNewMedicines(updated);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error(language === "bn" ? "টেমপ্লেট নাম দিন" : "Enter template name");
      return;
    }
    
    const validMedicines = newMedicines.filter(m => m.name.trim());
    if (validMedicines.length === 0) {
      toast.error(language === "bn" ? "অন্তত একটি ওষুধ যোগ করুন" : "Add at least one medicine");
      return;
    }

    saveTemplate({
      name: newTemplateName,
      medicines: validMedicines,
      advice: newTemplateAdvice || undefined,
    });

    // Reset form
    setIsCreateOpen(false);
    setNewTemplateName("");
    setNewTemplateAdvice("");
    setNewMedicines([{ name: "", dosage: "", duration: "", instructions: "" }]);
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
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
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
                {language === "bn" 
                  ? "দ্রুত প্রেসক্রিপশন তৈরির জন্য টেমপ্লেট সংরক্ষণ করুন" 
                  : "Save templates for quick prescription creation"}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(template.id)}
                    >
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
                        <span
                          key={i}
                          className="text-xs bg-muted px-2 py-0.5 rounded-full"
                        >
                          {med.name}
                        </span>
                      ))}
                      {template.medicines.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{template.medicines.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  {template.advice && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.advice}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === "bn" ? "নতুন টেমপ্লেট তৈরি করুন" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === "bn" ? "টেমপ্লেট নাম" : "Template Name"}</Label>
              <Input
                placeholder={language === "bn" ? "যেমন: জ্বর ও সর্দি" : "e.g., Fever & Cold"}
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{language === "bn" ? "ওষুধ" : "Medicines"}</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine}>
                  <Plus className="w-3 h-3 mr-1" />
                  {language === "bn" ? "যোগ করুন" : "Add"}
                </Button>
              </div>
              
              <div className="space-y-3">
                {newMedicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <Input
                      className="col-span-4"
                      placeholder={language === "bn" ? "ওষুধের নাম" : "Medicine name"}
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                    />
                    <Input
                      className="col-span-3"
                      placeholder={language === "bn" ? "ডোজ" : "Dosage"}
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    />
                    <Input
                      className="col-span-3"
                      placeholder={language === "bn" ? "সময়কাল" : "Duration"}
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-span-2 h-10 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMedicine(index)}
                      disabled={newMedicines.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === "bn" ? "উপদেশ (ঐচ্ছিক)" : "Advice (Optional)"}</Label>
              <Textarea
                placeholder={language === "bn" ? "সাধারণ উপদেশ..." : "General advice..."}
                value={newTemplateAdvice}
                onChange={(e) => setNewTemplateAdvice(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button onClick={handleSaveTemplate}>
              {language === "bn" ? "সংরক্ষণ করুন" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "bn" ? "টেমপ্লেট মুছে ফেলুন?" : "Delete Template?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "bn"
                ? "এই টেমপ্লেটটি স্থায়ীভাবে মুছে ফেলা হবে।"
                : "This template will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === "bn" ? "মুছে ফেলুন" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
