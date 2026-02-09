import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePublicBookingSlots, useCreateQueueBooking, useDoctorBookingStatus, BookingSlot } from "@/hooks/useUnifiedQueue";
import { DoctorProfile, Chamber } from "@/hooks/useDoctorProfile";
import { formatTime12Hour, formatCurrency } from "@/lib/doctor-profile-utils";
import { format, parseISO, isToday, isTomorrow, addDays, startOfDay } from "date-fns";
import { 
  Calendar, Clock, Users, MapPin, Loader2, 
  AlertCircle, ArrowLeft, ArrowRight, Lock, UserX
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
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    patient_gender: "",
    visiting_reason: "",
    is_follow_up: false,
  });

  const { slots, isLoading } = usePublicBookingSlots(profile.id);
  const { data: bookingStatus, isLoading: statusLoading } = useDoctorBookingStatus(profile.id);
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

  // Get available dates (16 days booking window)
  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate).filter(date => 
      slotsByDate[date].some(slot => slot.is_available)
    ).slice(0, 16);
  }, [slotsByDate]);

  // Split dates: first 8 as quick buttons, rest available via custom picker
  const quickDates = useMemo(() => availableDates.slice(0, 8), [availableDates]);
  
  // All 16 days range for custom date picker
  const dateRange = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      from: today,
      to: addDays(today, 15),
    };
  }, []);

  // Set of available date strings for the calendar
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

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
        visiting_reason: formData.visiting_reason.trim() || undefined,
        is_follow_up: formData.is_follow_up,
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
    // Use the actual waiting_ahead count from the API response (excludes completed/cancelled)
    const patientsAhead = bookingResult.waiting_ahead ?? (bookingResult.token_number - 1);
    const waitMinutes = patientsAhead * avgMinutes;
    const totalMinutes = hours * 60 + mins + waitMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMins = totalMinutes % 60;
    const estimatedTime = formatTime12Hour(`${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`);
    
    return {
      serialNumber: bookingResult.serial_number || `#${bookingResult.token_number}`, // Use unique serial number
      tokenNumber: bookingResult.token_number, // Queue position (token)
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

  if (isLoading || statusLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Check if doctor can accept new bookings (patient limit or subscription)
  if (bookingStatus && !bookingStatus.canBook) {
    return (
      <div className="py-8 text-center">
        <UserX className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h4 className="font-medium mb-1">Booking Unavailable</h4>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {bookingStatus.message}
        </p>
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
              
              <ScrollArea className="max-h-[400px]">
                <div className="grid grid-cols-2 gap-2 pr-2">
                  {quickDates.map(date => {
                    const isSelected = selectedDate === date;
                    
                    return (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setShowCustomDate(false); }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected 
                            ? "border-primary bg-primary text-primary-foreground shadow-lg" 
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        <div>
                          <p className={`font-medium text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                            {formatDateLabel(date)}
                          </p>
                          <p className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {format(parseISO(date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {/* Custom Date Picker Button */}
                  <Popover open={showCustomDate} onOpenChange={setShowCustomDate}>
                    <PopoverTrigger asChild>
                      <button
                        className={`p-3 rounded-lg border-2 text-left transition-all col-span-2 ${
                          selectedDate && !quickDates.includes(selectedDate)
                            ? "border-primary bg-primary text-primary-foreground shadow-lg"
                            : "border-dashed border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {selectedDate && !quickDates.includes(selectedDate) 
                              ? format(parseISO(selectedDate), "EEE, MMM d, yyyy")
                              : "Select Custom Date"
                            }
                          </span>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate ? parseISO(selectedDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const dateStr = format(date, "yyyy-MM-dd");
                            if (availableDateSet.has(dateStr)) {
                              setSelectedDate(dateStr);
                              setShowCustomDate(false);
                            }
                          }
                        }}
                        disabled={(date) => {
                          const dateStr = format(date, "yyyy-MM-dd");
                          return !availableDateSet.has(dateStr) || date < dateRange.from || date > dateRange.to;
                        }}
                        fromDate={dateRange.from}
                        toDate={dateRange.to}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </ScrollArea>
              
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
                    const isBookingClosed = slot.booking_open === false;
                    const isFull = slot.current_bookings >= slot.max_patients;
                    const isDisabled = !slot.is_available || isBookingClosed || isFull;
                    
                    return (
                      <button
                        key={`${slot.chamber_id}-${slot.start_time}-${idx}`}
                        disabled={isDisabled}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected 
                            ? "border-primary bg-primary text-primary-foreground shadow-lg" 
                            : isDisabled 
                              ? "opacity-50 cursor-not-allowed bg-muted" 
                              : "hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
                              <span className="font-medium">
                                {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                              </span>
                              {slot.session_status === "running" && (
                                <Badge className="bg-success text-success-foreground text-xs">
                                  Live
                                </Badge>
                              )}
                            </div>
                            <div className={`flex items-center gap-4 text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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
                          {isBookingClosed ? (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Closed
                            </Badge>
                          ) : isFull ? (
                            <Badge variant="destructive" className="text-xs">Full</Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-bold ${isSelected ? "bg-primary-foreground/90 text-primary border-primary-foreground/50" : ""}`}
                            >
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

                {/* Visit Type Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="follow-up" className="text-sm font-medium">Follow-up Visit</Label>
                    <p className="text-xs text-muted-foreground">Toggle if this is a return visit</p>
                  </div>
                  <Switch
                    id="follow-up"
                    checked={formData.is_follow_up}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_follow_up: checked }))}
                  />
                </div>

                {/* Visiting Reason */}
                <div className="space-y-1">
                  <Label htmlFor="reason">Visiting Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={formData.visiting_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, visiting_reason: e.target.value.slice(0, 200) }))}
                    placeholder="Briefly describe your symptoms or reason for visit"
                    className="resize-none h-16"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.visiting_reason.length}/200</p>
                </div>
              </div>
              
              {/* Fee Info */}
              <div className="p-3 rounded-lg border flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {formData.is_follow_up ? "Follow-up Fee" : "New Patient Fee"}
                  </span>
                  {formData.is_follow_up && (
                    <p className="text-xs text-muted-foreground">Return patient discount applied</p>
                  )}
                </div>
                <span className="font-bold text-primary">
                  {formatCurrency(
                    formData.is_follow_up 
                      ? (selectedSlot?.return_patient_fee || selectedSlot?.new_patient_fee || 500)
                      : (selectedSlot?.new_patient_fee || 500)
                  )}
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
