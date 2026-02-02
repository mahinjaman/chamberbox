import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User } from "lucide-react";

export default function StaffPatients() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch patients for the doctor
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["staff_patients", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewPatientList) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "রোগী" : "Patients"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewPatientList) {
    return null;
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  return (
    <StaffLayout 
      title={language === "bn" ? "রোগী" : "Patients"}
      description={language === "bn" 
        ? `মোট ${patients.length} জন রোগী` 
        : `Total ${patients.length} patients`}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "নাম বা ফোন দিয়ে খুঁজুন..." : "Search by name or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery 
                  ? (language === "bn" ? "কোনো রোগী পাওয়া যায়নি" : "No patients found")
                  : (language === "bn" ? "কোনো রোগী নেই" : "No patients yet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/staff/patients/${patient.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {patient.age && (
                        <p>{patient.age} {language === "bn" ? "বছর" : "years"}</p>
                      )}
                      {patient.gender && (
                        <p className="capitalize">{patient.gender}</p>
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
