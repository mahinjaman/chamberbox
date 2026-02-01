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
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { patients } = usePatients();
  const { queue, currentToken, waitingCount, completedCount, callNext } = useQueue();
  const [isPrescriptionPromptOpen, setIsPrescriptionPromptOpen] = useState(false);

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
      navigate(`/dashboard/prescriptions?patientId=${currentToken.patient_id}`);
    }
  };

  const handleSkipPrescription = async () => {
    setIsPrescriptionPromptOpen(false);
    await callNext();
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.full_name?.split(" ")[0] || "Doctor"}!`}
      description="Here's what's happening in your chamber today"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Patients Today"
          value={todaysPatients}
          description={`${waitingCount} waiting in queue`}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title="Current Token"
          value={currentToken ? `#${currentToken.token_number}` : "—"}
          description={currentToken?.patient?.name || "No one in queue"}
          icon={<Clock className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Total Patients"
          value={patients.length}
          description="Registered patients"
          icon={<Users className="w-6 h-6" />}
          variant="default"
        />
        <StatsCard
          title="Today's Earnings"
          value={`৳${estimatedEarnings.toLocaleString()}`}
          description="Estimated collection"
          icon={<CreditCard className="w-6 h-6" />}
          variant="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="justify-start h-auto py-4">
              <Link to="/dashboard/patients/new">
                <UserPlus className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">New Patient</div>
                  <div className="text-xs opacity-80">Register a patient</div>
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
                <div className="font-medium">Call Next</div>
                <div className="text-xs opacity-80">{waitingCount} waiting</div>
              </div>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/patients">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Patients</div>
                  <div className="text-xs opacity-80">Search & manage</div>
                </div>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start h-auto py-4">
              <Link to="/dashboard/queue">
                <Clock className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Queue</div>
                  <div className="text-xs opacity-80">Today's appointments</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today's Queue</CardTitle>
              <CardDescription>{queue.length} patients total</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/queue">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No patients in queue today</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/patients">Add patients to queue</Link>
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
    </DashboardLayout>
  );
};

export default Dashboard;
