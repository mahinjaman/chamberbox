import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { 
  Users, 
  ClipboardList, 
  Building2, 
  LogOut,
  FileText,
  Stethoscope
} from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { Loader2 } from "lucide-react";

const roleLabels = {
  receptionist: { en: "Receptionist", bn: "রিসেপশনিস্ট" },
  assistant: { en: "Assistant", bn: "সহকারী" },
  manager: { en: "Manager", bn: "ম্যানেজার" },
};

export default function StaffDashboard() {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const { staffInfo, staffInfoLoading, linkStaffAccount } = useStaff();
  const navigate = useNavigate();

  // Link staff account on first login
  useEffect(() => {
    if (user && !staffInfo && !staffInfoLoading) {
      linkStaffAccount();
    }
  }, [user, staffInfo, staffInfoLoading]);

  if (staffInfoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staffInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              {language === "bn" 
                ? "আপনার অ্যাকাউন্ট কোনো ডাক্তারের সাথে সংযুক্ত নেই।"
                : "Your account is not linked to any doctor."}
            </p>
            <Button onClick={signOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              {language === "bn" ? "লগ আউট" : "Log Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const doctor = staffInfo.doctor as { id: string; full_name: string; specialization: string; avatar_url: string } | null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">
                {doctor?.full_name || "Doctor"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {doctor?.specialization}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Staff Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{staffInfo.full_name}</h2>
                <p className="text-sm text-muted-foreground">{staffInfo.email}</p>
              </div>
              <Badge>
                {roleLabels[staffInfo.role as keyof typeof roleLabels]?.[language] || staffInfo.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Chamber Access */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {language === "bn" ? "আপনার চেম্বার অ্যাক্সেস" : "Your Chamber Access"}
          </h3>
          <div className="grid gap-4">
            {staffInfo.chamber_access?.map((access: any) => (
              <Card key={access.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{access.chamber?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {access.chamber?.address}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {access.can_manage_queue && (
                            <Badge variant="outline" className="text-xs">
                              {language === "bn" ? "কিউ ম্যানেজ" : "Queue"}
                            </Badge>
                          )}
                          {access.can_manage_patients && (
                            <Badge variant="outline" className="text-xs">
                              {language === "bn" ? "রোগী ম্যানেজ" : "Patients"}
                            </Badge>
                          )}
                          {access.can_view_prescriptions && (
                            <Badge variant="outline" className="text-xs">
                              {language === "bn" ? "প্রেসক্রিপশন দেখুন" : "Prescriptions"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {language === "bn" ? "দ্রুত অ্যাক্সেস" : "Quick Actions"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/staff/queue")}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-primary/10 mb-2">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium">
                  {language === "bn" ? "কিউ ম্যানেজ" : "Queue"}
                </h4>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/staff/patients")}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-secondary mb-2">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h4 className="font-medium">
                  {language === "bn" ? "রোগী" : "Patients"}
                </h4>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/staff/prescriptions")}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-accent mb-2">
                  <FileText className="w-6 h-6 text-accent-foreground" />
                </div>
                <h4 className="font-medium">
                  {language === "bn" ? "প্রেসক্রিপশন" : "Prescriptions"}
                </h4>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate("/staff/chambers")}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-muted mb-2">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium">
                  {language === "bn" ? "চেম্বার" : "Chambers"}
                </h4>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
