import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePublicBookingSlots, useCreateQueueBooking, BookingSlot } from "@/hooks/useUnifiedQueue";
import { DoctorProfile, Chamber } from "@/hooks/useDoctorProfile";
import { formatTime12Hour, formatCurrency } from "@/lib/doctor-profile-utils";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { 
  Calendar, Clock, Users, MapPin, Loader2, 
  AlertCircle, ArrowLeft, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { BookingSuccessCard } from "./BookingSuccessCard";

interface UnifiedBookingWidgetProps {
  profile: DoctorProfile;
  chamber: Chamber | null;
  onClose?: () => void;
}

type BookingStep = "date" | "slot" | "details" | "success";

export const UnifiedBookingWidget = ({ profile, chamber, onClose }: UnifiedBookingWidgetProps) => {
  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    patient_gender: "",
  });

  const { slots, isLoading } = usePublicBookingSlots(profile.id);
  const createBooking = useCreateQueueBooking();

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, BookingSlot[]> = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [slots]);

  // Get available dates
  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate).filter(date => 
      slotsByDate[date].some(slot => slot.is_available)
    ).slice(0, 14);
  }, [slotsByDate]);

  // Get slots for selected date
  const slotsForDate = selectedDate ? (slotsByDate[selectedDate] || []) : [];

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
    if (!selectedSlot || !canSubmit) return;
    
    try {
      const result = await createBooking.mutateAsync({
        doctor_id: profile.id,
        patient_name: formData.patient_name.trim(),
        patient_phone: formData.patient_phone,
        patient_age: parseInt(formData.patient_age),
        patient_gender: formData.patient_gender,
        chamber_id: selectedSlot.chamber_id,
        queue_date: selectedSlot.date,
        session_id: selectedSlot.session_id,
        is_public: true,
      });
      
      setBookingResult(result);
      setStep("success");
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Failed to book serial. Please try again.");
    }
  };

  const getEstimatedTimeDetails = () => {
    if (!bookingResult || !selectedSlot) return null;
    const [hours, mins] = selectedSlot.start_time.split(":").map(Number);
    const avgMinutes = selectedSlot.slot_duration_minutes || 5; // Use slot duration or default 5 mins
    const patientsAhead = bookingResult.token_number - 1;
    const waitMinutes = patientsAhead * avgMinutes;
    const totalMinutes = hours * 60 + mins + waitMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMins = totalMinutes % 60;
    const estimatedTime = formatTime12Hour(`${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`);
    
    return {
      serialNumber: bookingResult.token_number,
      patientsAhead,
      waitMinutes,
      estimatedTime,
      avgMinutes,
    };
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (availableDates.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h4 className="font-medium mb-1">No Slots Available</h4>
        <p className="text-sm text-muted-foreground">
          The doctor hasn't set up their availability schedule yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {step !== "success" && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span className={step === "date" ? "text-primary font-medium" : ""}>Date</span>
          <ArrowRight className="w-3 h-3" />
          <span className={step === "slot" ? "text-primary font-medium" : ""}>Time</span>
          <ArrowRight className="w-3 h-3" />
          <span className={step === "details" ? "text-primary font-medium" : ""}>Details</span>
        </div>
      )}

        <AnimatePresence mode="wait">
          {/* Step 1: Select Date */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Select a date for your appointment
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {availableDates.map(date => {
                  const dateSlots = slotsByDate[date] || [];
                  const totalAvailable = dateSlots.filter(s => s.is_available).length;
                  const isSelected = selectedDate === date;
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary" 
                          : "hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{formatDateLabel(date)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {totalAvailable} slot{totalAvailable !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <Button 
                className="w-full" 
                disabled={!selectedDate}
                onClick={() => setStep("slot")}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === "slot" && (
            <motion.div
              key="slot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {selectedDate && format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              
              <ScrollArea className="max-h-[180px]">
                <div className="space-y-2 pr-4">
                  {slotsForDate.map((slot, idx) => {
                    const isSelected = selectedSlot?.chamber_id === slot.chamber_id && 
                                       selectedSlot?.start_time === slot.start_time;
                    const isFull = !slot.is_available;
                    
                    return (
                      <button
                        key={`${slot.chamber_id}-${slot.start_time}-${idx}`}
                        disabled={isFull}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5 ring-2 ring-primary" 
                            : isFull 
                              ? "opacity-50 cursor-not-allowed bg-muted" 
                              : "hover:border-primary/50 hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                              </span>
                              {slot.session_status === "running" && (
                                <Badge className="bg-success text-success-foreground text-xs">
                                  Live
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {slot.chamber_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {slot.current_bookings}/{slot.max_patients}
                              </span>
                            </div>
                          </div>
                          {isFull ? (
                            <Badge variant="destructive" className="text-xs">Full</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-bold">
                              #{slot.current_bookings + 1}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Queue Preview - Show when slot is selected */}
              {selectedSlot && (() => {
                const nextSerial = selectedSlot.current_bookings + 1;
                const patientsAhead = selectedSlot.current_bookings;
                const avgMinutes = selectedSlot.slot_duration_minutes || 5;
                const waitMinutes = patientsAhead * avgMinutes;
                const [hours, mins] = selectedSlot.start_time.split(":").map(Number);
                const totalMinutes = hours * 60 + mins + waitMinutes;
                const arrivalHours = Math.floor(totalMinutes / 60) % 24;
                const arrivalMins = totalMinutes % 60;
                const expectedTime = formatTime12Hour(`${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`);

                return (
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Users className="w-3 h-3 text-amber-600" />
                          <p className="text-[10px] text-amber-700 dark:text-amber-400">Patients Ahead</p>
                        </div>
                        <p className="text-lg font-bold text-amber-600">{patientsAhead}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <p className="text-[10px] text-blue-700 dark:text-blue-400">Est. Wait</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">~{waitMinutes}<span className="text-xs font-normal">min</span></p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
                      <p className="text-[10px] text-muted-foreground">Expected Call Time</p>
                      <p className="text-lg font-bold text-emerald-600">{expectedTime}</p>
                      <p className="text-[10px] text-muted-foreground">Based on ~{avgMinutes} min per patient</p>
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedSlot(null);
                    setStep("date");
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!selectedSlot}
                  onClick={() => setStep("details")}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Patient Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {selectedSlot && formatTime12Hour(selectedSlot.start_time)} - {selectedSlot && formatTime12Hour(selectedSlot.end_time)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate && format(parseISO(selectedDate), "EEE, MMM d")} • {selectedSlot?.chamber_name}
                  </p>
                </div>
                <Badge variant="outline">
                  Serial #{(selectedSlot?.current_bookings || 0) + 1}
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
                  {formatCurrency(selectedSlot?.new_patient_fee || 500)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("slot")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!canSubmit || createBooking.isPending}
                  onClick={handleSubmit}
                >
                  {createBooking.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get Serial"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === "success" && bookingResult && selectedSlot && selectedDate && (
            <BookingSuccessCard
              bookingResult={bookingResult}
              selectedSlot={selectedSlot}
              selectedDate={selectedDate}
              formData={formData}
              profile={profile}
              timeDetails={getEstimatedTimeDetails()}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </div>
  );
};
