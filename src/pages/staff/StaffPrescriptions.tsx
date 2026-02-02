import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, FileText, Eye, Pill } from "lucide-react";
import { format } from "date-fns";
import { PrescriptionView } from "@/components/prescription/PrescriptionView";
import { Prescription } from "@/hooks/usePrescriptions";

export default function StaffPrescriptions() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch prescriptions for the doctor
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["staff_prescriptions", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patient:patients(name, phone, age, gender, blood_group)
        `)
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the data to match the Prescription type
      return data.map(item => ({
        ...item,
        medicines: (Array.isArray(item.medicines) ? item.medicines : []) as unknown as Prescription["medicines"],
        investigations: (Array.isArray(item.investigations) ? item.investigations : []) as unknown as Prescription["investigations"],
      })) as Prescription[];
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewPrescriptions) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "প্রেসক্রিপশন" : "Prescriptions"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewPrescriptions) {
    return null;
  }

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const patientName = rx.patient?.name?.toLowerCase() || "";
    const patientPhone = rx.patient?.phone || "";
    return patientName.includes(searchQuery.toLowerCase()) || patientPhone.includes(searchQuery);
  });

  const handleView = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewDialogOpen(true);
  };

  return (
    <StaffLayout 
      title={language === "bn" ? "প্রেসক্রিপশন" : "Prescriptions"}
      description={language === "bn" ? "শুধুমাত্র দেখার জন্য" : "View only access"}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "রোগীর নাম বা ফোন দিয়ে খুঁজুন..." : "Search by patient name or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Prescriptions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery 
                  ? (language === "bn" ? "কোনো প্রেসক্রিপশন পাওয়া যায়নি" : "No prescriptions found")
                  : (language === "bn" ? "কোনো প্রেসক্রিপশন নেই" : "No prescriptions yet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{prescription.patient?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {prescription.patient?.phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(prescription.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-muted-foreground hidden sm:block">
                        {prescription.medicines && Array.isArray(prescription.medicines) && (
                          <p className="flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {prescription.medicines.length} {language === "bn" ? "ওষুধ" : "medicines"}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleView(prescription)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "bn" ? "দেখুন" : "View"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Prescription Dialog */}
        <PrescriptionView
          prescription={selectedPrescription}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedPrescription(null);
          }}
        />
      </div>
    </StaffLayout>
  );
}
