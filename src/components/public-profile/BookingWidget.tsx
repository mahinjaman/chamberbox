import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorProfile, Chamber, AvailabilitySlot } from "@/hooks/useDoctorProfile";
import { useAppointments, BookingFormData } from "@/hooks/useAppointments";
import { DAYS_OF_WEEK, formatTime12Hour, formatCurrency, generateTimeSlots, formatPhoneNumber } from "@/lib/doctor-profile-utils";
import { format, addDays, isSameDay, isAfter, startOfDay } from "date-fns";
import { 
  Calendar as CalendarIcon, Clock, User, Phone, FileText, 
  CreditCard, Check, Loader2, ArrowLeft, ArrowRight,
  Download, Share2, CheckCircle2, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { WhatsAppConfirmation } from "./WhatsAppConfirmation";

interface BookingWidgetProps {
  profile: DoctorProfile;
  chamber: Chamber | null;
  availabilitySlots: AvailabilitySlot[];
  onClose?: () => void;
}

type BookingStep = "date" | "time" | "details" | "confirm" | "success";

export const BookingWidget = ({ profile, chamber, availabilitySlots, onClose }: BookingWidgetProps) => {
  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    patient_gender: "",
    symptoms: "",
    is_follow_up: false,
    payment_method: "cash",
  });

  const { createAppointment, getBookedSlots } = useAppointments();

  // Get available days from slots
  const availableDays = [...new Set(availabilitySlots.map(s => s.day_of_week))];

  // Generate next 14 available dates
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))
    .filter(date => availableDays.includes(date.getDay()))
    .slice(0, 14);

  // Generate time slots for selected date
  const getTimeSlotsForDate = (date: Date) => {
    const daySlot = availabilitySlots.find(s => s.day_of_week === date.getDay());
    if (!daySlot) return [];
    return generateTimeSlots(
      daySlot.start_time.slice(0, 5),
      daySlot.end_time.slice(0, 5),
      daySlot.slot_duration_minutes || 15
    );
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];

  // Load booked slots when date changes
  useEffect(() => {
    if (selectedDate && profile.id) {
      getBookedSlots(profile.id, format(selectedDate, "yyyy-MM-dd"))
        .then(slots => setBookedSlots(slots.map(s => s.slice(0, 5))));
    }
  }, [selectedDate, profile.id]);

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    if (!isAfter(date, today) && !isSameDay(date, today)) return true;
    return !availableDays.includes(date.getDay());
  };

  const fee = formData.is_follow_up 
    ? (chamber?.return_patient_fee || 300)
    : (chamber?.new_patient_fee || 500);

  const handleSubmit = async () => {
    if (!chamber || !selectedDate || !selectedTime) return;

    const bookingData: BookingFormData = {
      chamber_id: chamber.id,
      doctor_id: profile.id,
      patient_name: formData.patient_name,
      patient_phone: formData.patient_phone.replace(/\D/g, ""),
      patient_age: formData.patient_age ? Number(formData.patient_age) : undefined,
      patient_gender: formData.patient_gender || undefined,
      symptoms: formData.symptoms || undefined,
      is_follow_up: formData.is_follow_up,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      fee,
      payment_method: formData.payment_method,
    };

    try {
      const result = await createAppointment.mutateAsync(bookingData);
      setBookingResult(result);
      setStep("success");
      
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      toast.error("Failed to book appointment");
    }
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("01");
  };

  const canProceedToConfirm = 
    formData.patient_name.trim().length >= 2 &&
    validatePhone(formData.patient_phone);

  // Calculate estimated arrival time
  const getEstimatedTime = () => {
    if (!selectedTime || !bookingResult) return "";
    const [hours, mins] = selectedTime.split(":").map(Number);
    const tokenNumber = bookingResult.token_number || 1;
    const waitMinutes = (tokenNumber - 1) * 5; // 5 mins per patient
    const totalMinutes = hours * 60 + mins + waitMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60);
    const arrivalMins = totalMinutes % 60;
    return `${arrivalHours.toString().padStart(2, "0")}:${arrivalMins.toString().padStart(2, "0")}`;
  };

  const shareAppointment = () => {
    const text = `I've booked an appointment with ${profile.full_name}\n\n📅 Date: ${selectedDate ? format(selectedDate, "PPP") : ""}\n🎫 Token: #${bookingResult?.token_number}\n⏰ Expected Time: ${formatTime12Hour(getEstimatedTime())}\n📍 ${chamber?.name}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  if (!chamber) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No chamber available for booking</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Book Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        {step !== "success" && (
          <div className="flex items-center justify-between mb-4">
            {(["date", "time", "details", "confirm"] as BookingStep[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s 
                      ? "bg-primary text-primary-foreground" 
                      : ["date", "time", "details", "confirm"].indexOf(step) > i
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {["date", "time", "details", "confirm"].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      ["date", "time", "details", "confirm"].indexOf(step) > i 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Date Selection */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                Select Date
              </div>

              {/* Quick Date Chips */}
              <div className="flex flex-wrap gap-2">
                {availableDates.slice(0, 7).map(date => (
                  <Badge
                    key={date.toISOString()}
                    variant={selectedDate && isSameDay(date, selectedDate) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-center">
                      <div className="text-xs">{format(date, "EEE")}</div>
                      <div className="font-bold">{format(date, "d")}</div>
                    </div>
                  </Badge>
                ))}
              </div>

              {/* Full Calendar */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border pointer-events-auto"
              />

              <Button 
                className="w-full" 
                disabled={!selectedDate}
                onClick={() => setStep("time")}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Time Selection */}
          {step === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Select Time - {selectedDate && format(selectedDate, "EEEE, MMMM d")}
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto">
                {timeSlots.map(time => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={isBooked ? "opacity-50 line-through" : ""}
                    >
                      {formatTime12Hour(time)}
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary" />
                  Selected
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted" />
                  Available
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted opacity-50" />
                  Booked
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("date")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!selectedTime}
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Patient Information
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
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.patient_age}
                      onChange={(e) => setFormData(prev => ({ ...prev, patient_age: e.target.value }))}
                      placeholder="বয়স"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gender</Label>
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
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Briefly describe your symptoms..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Patient Type</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_follow_up ? "Follow-up visit" : "New patient (first visit)"}
                    </p>
                  </div>
                  <RadioGroup
                    value={formData.is_follow_up ? "followup" : "new"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, is_follow_up: v === "followup" }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="text-sm">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="followup" id="followup" />
                      <Label htmlFor="followup" className="text-sm">Follow-up</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("time")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!canProceedToConfirm}
                  onClick={() => setStep("confirm")}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                Confirm Booking
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{selectedDate && format(selectedDate, "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedTime && formatTime12Hour(selectedTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Patient</p>
                    <p className="font-medium">{formData.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{formatPhoneNumber(formData.patient_phone)}</p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Payment Summary</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Consultation Fee ({formData.is_follow_up ? "Follow-up" : "New Patient"})</span>
                  <span>{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(fee)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <RadioGroup
                value={formData.payment_method}
                onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="pay-cash"
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.payment_method === "cash" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value="cash" id="pay-cash" />
                  <div>
                    <p className="font-medium">Pay at Chamber</p>
                    <p className="text-xs text-muted-foreground">Cash/Card</p>
                  </div>
                </Label>
                <Label
                  htmlFor="pay-online"
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.payment_method === "bkash" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value="bkash" id="pay-online" />
                  <div>
                    <p className="font-medium">bKash</p>
                    <p className="text-xs text-muted-foreground">Pay Online</p>
                  </div>
                </Label>
              </RadioGroup>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedTerms}
                  onCheckedChange={(checked) => setAgreedTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  I agree that if I arrive more than 15 minutes late, my appointment may be rescheduled.
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("details")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!agreedTerms || createAppointment.isPending}
                  onClick={handleSubmit}
                >
                  {createAppointment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === "success" && bookingResult && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Booking Confirmed!</h3>
                <p className="text-muted-foreground">Your appointment has been scheduled</p>
              </div>

              {/* Token Display */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border">
                <p className="text-sm text-muted-foreground mb-1">Your Token Number</p>
                <p className="text-5xl font-bold text-primary">#{bookingResult.token_number}</p>
                <p className="text-sm mt-2">
                  Estimated Time: <span className="font-bold">{formatTime12Hour(getEstimatedTime())}</span>
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p>📅 {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                <p>📍 {chamber.name}</p>
                <p>💰 Fee: {formatCurrency(fee)} (Pay at chamber)</p>
              </div>

              {/* WhatsApp Confirmation */}
              <WhatsAppConfirmation
                patientName={formData.patient_name}
                doctorName={profile.full_name}
                date={selectedDate ? format(selectedDate, "PPP") : ""}
                time={selectedTime ? formatTime12Hour(selectedTime) : ""}
                tokenNumber={bookingResult.token_number}
                chamberAddress={chamber.address}
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={shareAppointment}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button 
                className="w-full"
                onClick={() => {
                  onClose?.();
                  // Reset form for new booking
                  setStep("date");
                  setSelectedDate(undefined);
                  setSelectedTime(undefined);
                  setFormData({
                    patient_name: "",
                    patient_phone: "",
                    patient_age: "",
                    patient_gender: "",
                    symptoms: "",
                    is_follow_up: false,
                    payment_method: "cash",
                  });
                  setAgreedTerms(false);
                  setBookingResult(null);
                }}
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
