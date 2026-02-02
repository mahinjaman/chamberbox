import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublicQueueSessions, PublicQueueSession } from "@/hooks/useQueueSessions";
import { supabase } from "@/integrations/supabase/client";
import { DoctorProfile, Chamber } from "@/hooks/useDoctorProfile";
import { formatTime12Hour, formatCurrency } from "@/lib/doctor-profile-utils";
import { format } from "date-fns";
import { 
  Clock, Users, MapPin, Ticket, Loader2, 
  CheckCircle2, AlertCircle, User, Phone, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface QueueBookingWidgetProps {
  profile: DoctorProfile;
  chamber: Chamber | null;
  onClose?: () => void;
}

type BookingStep = "select" | "details" | "success";

export const QueueBookingWidget = ({ profile, chamber, onClose }: QueueBookingWidgetProps) => {
  const [step, setStep] = useState<BookingStep>("select");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ token_number: number; session: any } | null>(null);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    patient_gender: "",
  });

  const { sessions, isLoading } = usePublicQueueSessions(profile.id);
  
  const selectedSession: PublicQueueSession | undefined = sessions.find(s => s.id === selectedSessionId);
  

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("01");
  };

  const canSubmit = 
    formData.patient_name.trim().length >= 2 &&
    validatePhone(formData.patient_phone) &&
    formData.patient_age &&
    formData.patient_gender;

  const handleSubmit = async () => {
    if (!selectedSession || !canSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      // First create or find patient
      const phone = formData.patient_phone.replace(/\D/g, "");
      
      // Check if patient exists for this doctor
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("doctor_id", profile.id)
        .eq("phone", phone)
        .maybeSingle();
      
      let patientId: string;
      
      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({
            doctor_id: profile.id,
            name: formData.patient_name.trim(),
            phone: phone,
            age: parseInt(formData.patient_age),
            gender: formData.patient_gender,
          })
          .select()
          .single();
        
        if (patientError) throw patientError;
        patientId = newPatient.id;
      }
      
      // Create queue token
      const { data: token, error: tokenError } = await supabase
        .from("queue_tokens")
        .insert({
          doctor_id: profile.id,
          patient_id: patientId,
          session_id: selectedSession.id,
          chamber_id: selectedSession.chamber_id,
          queue_date: selectedSession.session_date,
          status: "waiting",
          booked_by: "public",
          token_number: 0, // Will be set by trigger
        })
        .select()
        .single();
      
      if (tokenError) throw tokenError;
      
      setBookingResult({ 
        token_number: token.token_number, 
        session: selectedSession 
      });
      setStep("success");
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
    } catch (error: any) {
      console.error("Booking error:", error);
      if (error.message?.includes("Rate limit")) {
        toast.error("Too many bookings. Please wait and try again.");
      } else {
        toast.error("Failed to book serial. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimatedTime = () => {
    if (!bookingResult || !selectedSession) return "";
    const [hours, mins] = selectedSession.start_time.slice(0, 5).split(":").map(Number);
    const waitMinutes = (bookingResult.token_number - 1) * (selectedSession.avg_consultation_minutes || 5);
    const totalMinutes = hours * 60 + mins + waitMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60);
    const arrivalMins = totalMinutes % 60;
    return formatTime12Hour(`${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h4 className="font-medium mb-1">No Queue Available</h4>
          <p className="text-sm text-muted-foreground">
            The doctor hasn't opened queue for today yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Take Serial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Session */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Select a time slot to get your serial number
              </p>
              
              <div className="space-y-2">
                {sessions.map(session => {
                  const isFull = (session.tokens_count || 0) >= session.max_patients;
                  const isBookingClosed = session.booking_open === false;
                  const isDisabled = isFull || isBookingClosed;
                  const isSelected = selectedSessionId === session.id;
                  
                  return (
                    <button
                      key={session.id}
                      disabled={isDisabled}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary" 
                          : isDisabled 
                            ? "opacity-50 cursor-not-allowed bg-muted" 
                            : "hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatTime12Hour(session.start_time.slice(0, 5))} - {formatTime12Hour(session.end_time.slice(0, 5))}
                            </span>
                            {session.status === "running" && (
                              <Badge className="bg-success text-success-foreground">
                                Live
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.chamber?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {session.tokens_count || 0}/{session.max_patients} patients
                            </span>
                          </div>
                        </div>
                        {isBookingClosed ? (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                            <Lock className="w-3 h-3 mr-1" />
                            Closed
                          </Badge>
                        ) : isFull ? (
                          <Badge variant="destructive">Full</Badge>
                        ) : (
                          <Badge variant="outline">
                            Serial #{(session.tokens_count || 0) + 1}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <Button 
                className="w-full" 
                disabled={!selectedSessionId}
                onClick={() => setStep("details")}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Patient Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">
                    {selectedSession && formatTime12Hour(selectedSession.start_time.slice(0, 5))} - {selectedSession && formatTime12Hour(selectedSession.end_time.slice(0, 5))}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedSession?.chamber?.name}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Serial #{(selectedSession?.tokens_count || 0) + 1}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                    placeholder="রোগীর নাম / Patient Name"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    value={formData.patient_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setFormData(prev => ({ ...prev, patient_phone: value }));
                    }}
                    placeholder="01XXXXXXXXX"
                  />
                  {formData.patient_phone && !validatePhone(formData.patient_phone) && (
                    <p className="text-xs text-destructive">Enter valid Bangladesh number (01XXXXXXXXX)</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.patient_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, patient_age: e.target.value }))}
                      placeholder="বয়স"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gender *</Label>
                    <Select
                      value={formData.patient_gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, patient_gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Fee Info */}
              <div className="p-3 rounded-lg border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Consultation Fee</span>
                <span className="font-bold text-primary">
                  {formatCurrency(chamber?.new_patient_fee || 500)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("select")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get Serial"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && bookingResult && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold">Serial Confirmed!</h3>
                <p className="text-muted-foreground">
                  Your serial number has been booked
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Your Serial Number</p>
                <p className="text-5xl font-bold text-primary">#{bookingResult.token_number}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedSession?.session_date || ""), "PP")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Expected Time</p>
                  <p className="font-medium">{getEstimatedTime()}</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                <p className="text-warning-foreground">
                  Please arrive 15 minutes before your expected time
                </p>
              </div>
              
              {onClose && (
                <Button onClick={onClose} variant="outline" className="w-full">
                  Done
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
