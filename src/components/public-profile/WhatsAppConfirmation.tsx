import { motion } from "framer-motion";
import { MessageCircle, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppConfirmationProps {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  tokenNumber: number;
  chamberAddress: string;
  whatsappNumber?: string;
}

export const WhatsAppConfirmation = ({
  patientName,
  doctorName,
  date,
  time,
  tokenNumber,
  chamberAddress,
  whatsappNumber,
}: WhatsAppConfirmationProps) => {
  const confirmationMessage = `প্রিয় ${patientName},

আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে! ✅

👨‍⚕️ ডাক্তার: ${doctorName}
📅 তারিখ: ${date}
⏰ সময়: ${time}
🎫 সিরিয়াল: #${tokenNumber}
📍 ঠিকানা: ${chamberAddress}

দয়া করে নির্ধারিত সময়ের ১৫ মিনিট আগে উপস্থিত হন।

ধন্যবাদ,
ChamberBox`;

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(confirmationMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      {/* WhatsApp Banner */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-700 dark:text-green-400">
              Confirmation sent to WhatsApp
            </span>
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground">
            Check your WhatsApp for appointment details
          </p>
        </div>
      </div>

      {/* Message Preview */}
      <div className="relative">
        <div className="absolute -top-2 left-4 px-2 bg-background text-xs text-muted-foreground">
          Message Preview
        </div>
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white dark:bg-card p-3 rounded-lg rounded-tl-none shadow-sm text-sm whitespace-pre-wrap">
                {confirmationMessage}
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                Just now ✓✓
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <Button 
        variant="outline" 
        className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Share via WhatsApp
      </Button>

      {/* Contact for queries */}
      {whatsappNumber && (
        <div className="text-center text-sm text-muted-foreground">
          Questions? Contact us on{" "}
          <a 
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            WhatsApp
          </a>
        </div>
      )}
    </motion.div>
  );
};
