import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients } from "@/hooks/usePatients";
import { useQueue } from "@/hooks/useQueue";
import { useProfile } from "@/hooks/useProfile";
import { 
  Users, 
  Clock, 
  CreditCard, 
  UserPlus,
  ArrowRight,
  Play,
  FileText,
  SkipForward
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrescriptionModal } from "@/components/queue/PrescriptionModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const Dashboard = () => {
  const { profile } = useProfile();
  const { patients } = usePatients();
  const { queue, currentToken, waitingCount, completedCount, callNext } = useQueue();
  const [isPrescriptionPromptOpen, setIsPrescriptionPromptOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const { t } = useLanguage();

  const todaysPatients = completedCount + (currentToken ? 1 : 0);
  const estimatedEarnings = todaysPatients * 500; // Placeholder: ৳500 per visit

  const handleCallNextClick = () => {
    if (currentToken) {
      setIsPrescriptionPromptOpen(true);
    } else {
      callNext();
    }
  };

  const handleMakePrescriptionAndCallNext = () => {
    setIsPrescriptionPromptOpen(false);
    if (currentToken) {
      setIsPrescriptionModalOpen(true);
    }
  };

  const handleSkipPrescription = async () => {
    setIsPrescriptionPromptOpen(false);
    await callNext();
  };

  const handlePrescriptionSuccess = async () => {
    setIsPrescriptionModalOpen(false);
    await callNext();
  };

  return (
    <DashboardLayout
      title={`${t.dashboard.welcome}, ${profile?.full_name?.split(" ")[0] || "Doctor"}!`}
      description={t.landing.heroSubtitle.split('.')[0]}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title={t.dashboard.todayAppointments}
          value={todaysPatients}
          description={`${waitingCount} ${t.queue.patientsWaiting.toLowerCase()}`}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title={t.queue.currentToken}
          value={currentToken ? `#${currentToken.token_number}` : "—"}
          description={currentToken?.patient?.name || t.queue.queueEmpty}
          icon={<Clock className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title={t.dashboard.totalPatients}
          value={patients.length}
          description={t.patients.title}
          icon={<Users className="w-6 h-6" />}
          variant="default"
        />
        <StatsCard
          title={t.dashboard.totalRevenue}
          value={`৳${estimatedEarnings.toLocaleString()}`}
          description={t.finances.income}
          icon={<CreditCard className="w-6 h-6" />}
          variant="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.quickActions}</CardTitle>
            <CardDescription>{t.common.actions}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="justify-start h-auto py-4">
              <Link to="/dashboard/patients/new">
                <UserPlus className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.dashboard.newPatient}</div>
                  <div className="text-xs opacity-80">{t.patients.addPatient}</div>
                </div>
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={handleCallNextClick}
              disabled={waitingCount === 0 && !currentToken}
            >
              <Play className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{t.queue.callNext}</div>
                <div className="text-xs opacity-80">{waitingCount} {t.queue.patientsWaiting.toLowerCase()}</div>
              </div>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/patients">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.patients.title}</div>
                  <div className="text-xs opacity-80">{t.common.search}</div>
                </div>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/queue">
                <Clock className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{t.queue.queueManagement}</div>
                  <div className="text-xs opacity-80">{t.common.today}</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t.queue.currentQueue}</CardTitle>
              <CardDescription>{queue.length} {t.patients.title.toLowerCase()}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/queue">
                {t.common.view} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.queue.queueEmpty}</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/patients">{t.queue.addToQueue}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.slice(0, 5).map((token) => (
                  <div
                    key={token.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      token.status === "current" && "bg-success/5 border-success/30",
                      token.status === "waiting" && "bg-muted/50 border-border",
                      token.status === "completed" && "bg-muted/30 border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          token.status === "current" && "bg-success text-success-foreground",
                          token.status === "waiting" && "bg-warning text-warning-foreground",
                          token.status === "completed" && "bg-muted text-muted-foreground"
                        )}
                      >
                        #{token.token_number}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {token.patient?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {token.patient?.phone}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        token.status === "current"
                          ? "default"
                          : token.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {token.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prescription Prompt Dialog */}
      <Dialog open={isPrescriptionPromptOpen} onOpenChange={setIsPrescriptionPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Prescription?</DialogTitle>
            <DialogDescription>
              {currentToken?.patient?.name} is currently being served. Would you like to create a prescription before calling the next patient?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleMakePrescriptionAndCallNext} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Make Prescription
            </Button>
            <Button variant="outline" onClick={handleSkipPrescription} className="w-full">
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Call Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={currentToken?.patient ? {
          id: currentToken.patient_id,
          name: currentToken.patient.name,
          phone: currentToken.patient.phone,
          age: currentToken.patient.age,
          gender: currentToken.patient.gender,
          blood_group: currentToken.patient.blood_group,
        } : null}
        onSuccess={handlePrescriptionSuccess}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
