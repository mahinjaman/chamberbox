import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Phone, 
  Calendar,
  FileText,
  Clock,
  Pill,
  AlertTriangle,
  Activity,
  Loader2,
  User
} from "lucide-react";
import { format } from "date-fns";

export default function StaffPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch patient
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["staff_patient_detail", id, doctorId],
    queryFn: async () => {
      if (!doctorId || !id) return null;
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("doctor_id", doctorId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId && !!id,
  });

  // Fetch visits
  const { data: visits = [] } = useQuery({
    queryKey: ["staff_patient_visits", id, doctorId],
    queryFn: async () => {
      if (!doctorId || !id) return [];
      
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("patient_id", id)
        .eq("doctor_id", doctorId)
        .order("visit_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId && !!id,
  });

  // Fetch prescriptions
  const { data: prescriptions = [] } = useQuery({
    queryKey: ["staff_patient_prescriptions", id, doctorId],
    queryFn: async () => {
      if (!doctorId || !id) return [];
      
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", id)
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId && !!id,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewPatientList) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading || patientLoading) {
    return (
      <StaffLayout title={language === "bn" ? "রোগীর বিবরণ" : "Patient Details"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewPatientList) {
    return null;
  }

  if (!patient) {
    return (
      <StaffLayout title={language === "bn" ? "রোগী পাওয়া যায়নি" : "Patient Not Found"}>
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">
              {language === "bn" ? "রোগী পাওয়া যায়নি বা মুছে ফেলা হয়েছে।" : "Patient not found or has been deleted."}
            </p>
            <Button onClick={() => navigate("/staff/patients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "bn" ? "রোগী তালিকায় ফিরুন" : "Back to Patients"}
            </Button>
          </CardContent>
        </Card>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout
      title={patient.name}
      description={patient.phone}
    >
      <Button variant="ghost" onClick={() => navigate("/staff/patients")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === "bn" ? "রোগী তালিকায় ফিরুন" : "Back to Patients"}
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "bn" ? "রোগীর তথ্য" : "Patient Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            {patient.age && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{patient.age} {language === "bn" ? "বছর" : "years old"}</span>
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
            
            {/* Allergies Alert */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{language === "bn" ? "অ্যালার্জি" : "Allergies"}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy: string, i: number) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">{language === "bn" ? "দীর্ঘস্থায়ী রোগ" : "Chronic Conditions"}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.chronic_conditions.map((condition: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.address && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">{language === "bn" ? "ঠিকানা" : "Address"}</p>
                <p>{patient.address}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t">
              {language === "bn" ? "নিবন্ধিত: " : "Registered: "}
              {format(new Date(patient.created_at), "dd MMM yyyy")}
            </div>
          </CardContent>
        </Card>

        {/* Visit History & Prescriptions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{language === "bn" ? "চিকিৎসা ইতিহাস" : "Medical History"}</CardTitle>
            <CardDescription>
              {visits.length} {language === "bn" ? "টি ভিজিট রেকর্ড আছে" : "visits recorded"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visits">
              <TabsList>
                <TabsTrigger value="visits">
                  <Clock className="mr-2 h-4 w-4" />
                  {language === "bn" ? "ভিজিট" : "Visits"} ({visits.length})
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <FileText className="mr-2 h-4 w-4" />
                  {language === "bn" ? "প্রেসক্রিপশন" : "Prescriptions"} ({prescriptions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visits" className="mt-4">
                {visits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === "bn" ? "এখনো কোনো ভিজিট রেকর্ড নেই" : "No visits recorded yet"}</p>
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
                              <span className="text-sm font-medium">
                                {language === "bn" ? "লক্ষণ: " : "Symptoms: "}
                              </span>
                              <span className="text-sm text-muted-foreground">{visit.symptoms}</span>
                            </div>
                          )}
                          {visit.diagnosis && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">
                                {language === "bn" ? "রোগ নির্ণয়: " : "Diagnosis: "}
                              </span>
                              <span className="text-sm text-muted-foreground">{visit.diagnosis}</span>
                            </div>
                          )}
                          {visit.advice && (
                            <div>
                              <span className="text-sm font-medium">
                                {language === "bn" ? "পরামর্শ: " : "Advice: "}
                              </span>
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
                    <p>{language === "bn" ? "এখনো কোনো প্রেসক্রিপশন নেই" : "No prescriptions yet"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => {
                      const medicines = Array.isArray(rx.medicines) ? rx.medicines : [];
                      return (
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
                                {medicines.length} {language === "bn" ? "ওষুধ" : "medicine"}{medicines.length !== 1 && "s"}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {medicines.slice(0, 3).map((med: any, i: number) => (
                                <p key={i} className="text-sm text-muted-foreground">
                                  • {med.name} - {med.dosage} ({med.duration})
                                </p>
                              ))}
                              {medicines.length > 3 && (
                                <p className="text-sm text-muted-foreground">
                                  +{medicines.length - 3} {language === "bn" ? "আরো" : "more"}
                                </p>
                              )}
                            </div>
                            {rx.next_visit_date && (
                              <p className="text-sm text-primary mt-2">
                                {language === "bn" ? "পরবর্তী ভিজিট: " : "Next visit: "}
                                {format(new Date(rx.next_visit_date), "dd MMM yyyy")}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
