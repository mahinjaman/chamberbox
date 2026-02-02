import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Users, MapPin, 
  CheckCircle2, FileText, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { formatTime12Hour, formatCurrency } from "@/lib/doctor-profile-utils";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface BookingSuccessCardProps {
  bookingResult: any;
  selectedSlot: any;
  selectedDate: string;
  formData: {
    patient_name: string;
    patient_phone: string;
  };
  profile: {
    full_name: string;
  };
  timeDetails: {
    serialNumber: string; // Unique booking reference (e.g., 260203-1234-0001)
    tokenNumber: number; // Queue position (e.g., 3)
    patientsAhead: number;
    waitMinutes: number;
    estimatedTime: string;
    avgMinutes: number;
  } | null;
  onClose?: () => void;
}

export const BookingSuccessCard = ({
  bookingResult,
  selectedSlot,
  selectedDate,
  formData,
  profile,
  timeDetails,
  onClose,
}: BookingSuccessCardProps) => {
  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Appointment Confirmed", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("ChamberBox", pageWidth / 2, 32, { align: "center" });
    
    // Serial Number Box
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.text("Your Booking Reference", pageWidth / 2, 52, { align: "center" });
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166);
    doc.text(`${timeDetails?.serialNumber}`, pageWidth / 2, 65, { align: "center" });
    
    // Token Number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Queue Position: #${timeDetails?.tokenNumber}`, pageWidth / 2, 75, { align: "center" });
    
    // Info section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    
    const startY = 90;
    const lineHeight = 10;
    
    doc.text(`Patient: ${formData.patient_name}`, 20, startY);
    doc.text(`Doctor: ${profile.full_name}`, 20, startY + lineHeight);
    doc.text(`Date: ${format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}`, 20, startY + lineHeight * 2);
    doc.text(`Time: ${formatTime12Hour(selectedSlot.start_time)} - ${formatTime12Hour(selectedSlot.end_time)}`, 20, startY + lineHeight * 3);
    doc.text(`Chamber: ${selectedSlot.chamber_name}`, 20, startY + lineHeight * 4);
    doc.text(`Address: ${selectedSlot.chamber_address}`, 20, startY + lineHeight * 5);
    
    // Queue Info
    doc.setFillColor(245, 245, 245);
    doc.rect(15, startY + lineHeight * 6.5, pageWidth - 30, 25, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Patients Ahead: ${timeDetails?.patientsAhead}`, 25, startY + lineHeight * 7.5);
    doc.text(`Est. Wait: ~${timeDetails?.waitMinutes} min`, 80, startY + lineHeight * 7.5);
    doc.text(`Expected Time: ${timeDetails?.estimatedTime}`, 140, startY + lineHeight * 7.5);
    
    // Fee
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Consultation Fee: ${formatCurrency(selectedSlot.new_patient_fee || 500)} (Pay at chamber)`, 20, startY + lineHeight * 10);
    
    // Notice
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(15, startY + lineHeight * 11.5, pageWidth - 30, 15, 'F');
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text("Please arrive 15 minutes before your expected time", pageWidth / 2, startY + lineHeight * 12.5, { align: "center" });
    
    const fileName = timeDetails?.serialNumber?.replace(/[^a-zA-Z0-9-]/g, '-') || `token-${timeDetails?.tokenNumber}`;
    doc.save(`booking-${fileName}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Downloadable Card */}
      <div className="bg-card rounded-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-center text-white">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
          <h3 className="text-lg font-bold">Booking Confirmed!</h3>
          <p className="text-sm text-white/80">Your appointment has been scheduled</p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Booking Reference (Serial Number) */}
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-lg font-bold text-primary font-mono">{timeDetails?.serialNumber}</p>
          </div>

          {/* Queue Position (Token Number) */}
          <div className="text-center py-3 bg-muted/30 rounded-xl">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your Queue Position</p>
            <p className="text-5xl font-black text-primary">#{timeDetails?.tokenNumber}</p>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Ahead</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{timeDetails?.patientsAhead || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-400">Wait</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">~{timeDetails?.waitMinutes || 0}<span className="text-sm font-normal">m</span></p>
            </div>
          </div>

          {/* Expected Time */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-xs text-muted-foreground">Expected Call Time</p>
            <p className="text-xl font-bold text-emerald-600">{timeDetails?.estimatedTime}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Date
              </span>
              <span className="font-medium">{format(parseISO(selectedDate), "EEE, MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Session
              </span>
              <span className="font-medium">{formatTime12Hour(selectedSlot.start_time)} - {formatTime12Hour(selectedSlot.end_time)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Chamber
              </span>
              <span className="font-medium">{selectedSlot.chamber_name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-bold text-primary">{formatCurrency(selectedSlot.new_patient_fee || 500)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="default" 
          onClick={downloadAsPDF}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Save as PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline" className="flex-1">
            Book Another
          </Button>
        )}
      </div>
      
      {/* Arrival Notice */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Please arrive <span className="font-bold">15 minutes</span> before your expected time
        </p>
      </div>
    </motion.div>
  );
};
