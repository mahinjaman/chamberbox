import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppConfirmationProps {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  tokenNumber: number;
  chamberAddress: string;
}

export const WhatsAppConfirmation = ({
  patientName,
  doctorName,
  date,
  time,
  tokenNumber,
  chamberAddress,
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
    <Button 
      variant="outline" 
      className="w-full border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
      onClick={handleWhatsAppShare}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Share via WhatsApp
    </Button>
  );
};
