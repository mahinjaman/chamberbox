import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText } from "lucide-react";
import { format } from "date-fns";

export default function StaffPrescriptions() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
          patient:patients(name, phone, age, gender)
        `)
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
    const patientName = (rx.patient as any)?.name?.toLowerCase() || "";
    return patientName.includes(searchQuery.toLowerCase());
  });

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
            placeholder={language === "bn" ? "রোগীর নাম দিয়ে খুঁজুন..." : "Search by patient name..."}
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
                        <h3 className="font-medium">{(prescription.patient as any)?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(prescription.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {prescription.medicines && Array.isArray(prescription.medicines) && (
                        <p>
                          {prescription.medicines.length} {language === "bn" ? "ওষুধ" : "medicines"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
