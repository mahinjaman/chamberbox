import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, MapPin, Phone } from "lucide-react";

export default function StaffChambers() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading } = useStaff();

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "চেম্বার" : "Chambers"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  const chambers = staffInfo?.chamber_access?.map((access: any) => access.chamber) || [];

  return (
    <StaffLayout 
      title={language === "bn" ? "চেম্বার" : "Chambers"}
      description={language === "bn" 
        ? `আপনার ${chambers.length}টি চেম্বারে অ্যাক্সেস আছে` 
        : `You have access to ${chambers.length} chambers`}
    >
      <div className="space-y-4">
        {chambers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {language === "bn" ? "কোনো চেম্বার অ্যাক্সেস নেই" : "No chamber access"}
              </p>
            </CardContent>
          </Card>
        ) : (
          chambers.map((chamber: any) => (
            <Card key={chamber.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{chamber.name}</h3>
                      {chamber.is_primary && (
                        <Badge>{language === "bn" ? "প্রধান" : "Primary"}</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{chamber.address}</span>
                      </div>
                      {chamber.contact_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{chamber.contact_number}</span>
                        </div>
                      )}
                    </div>
                    {(chamber.new_patient_fee || chamber.return_patient_fee) && (
                      <div className="mt-4 flex gap-4 text-sm">
                        {chamber.new_patient_fee && (
                          <div>
                            <span className="text-muted-foreground">
                              {language === "bn" ? "নতুন রোগী:" : "New Patient:"}
                            </span>{" "}
                            <span className="font-medium">৳{chamber.new_patient_fee}</span>
                          </div>
                        )}
                        {chamber.return_patient_fee && (
                          <div>
                            <span className="text-muted-foreground">
                              {language === "bn" ? "পুরাতন রোগী:" : "Return Patient:"}
                            </span>{" "}
                            <span className="font-medium">৳{chamber.return_patient_fee}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </StaffLayout>
  );
}
