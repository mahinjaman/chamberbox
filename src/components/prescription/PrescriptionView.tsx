import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Prescription, PrescriptionMedicine } from "@/hooks/usePrescriptions";
import { useProfile } from "@/hooks/useProfile";
import { Printer, Download, Share2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface SelectedInvestigation {
  id: string;
  name: string;
  name_bn?: string;
}

interface PrescriptionViewProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionView = ({
  prescription,
  isOpen,
  onClose,
}: PrescriptionViewProps) => {
  const { profile } = useProfile();
  const printRef = useRef<HTMLDivElement>(null);

  if (!prescription) return null;

  const investigations = (prescription as any).investigations as SelectedInvestigation[] || [];

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription.patient?.name}</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #555; font-size: 14px; }
            .patient-info { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
            .patient-info div { font-size: 14px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
            .section-title .rx { font-size: 24px; }
            .medicine-item { margin-bottom: 8px; padding-left: 15px; }
            .medicine-name { font-weight: 600; }
            .medicine-details { color: #555; font-size: 13px; margin-left: 15px; }
            .investigation-item { display: inline-block; background: #f3f4f6; padding: 4px 10px; border-radius: 4px; margin: 2px; font-size: 13px; }
            .advice { white-space: pre-line; font-size: 14px; }
            .next-visit { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 14px; }
            .footer { margin-top: 40px; text-align: right; }
            .signature-line { border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            <div class="signature-line">
              <strong>${profile?.full_name || "Doctor"}</strong>
              <br />
              <span style="font-size: 12px; color: #555;">${profile?.specialization || ""}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    // Use print to PDF functionality
    toast.info("Use Print → Save as PDF to download");
    handlePrint();
  };

  const handleShareWhatsApp = () => {
    if (!prescription.patient?.phone) {
      toast.error("Patient phone number not available");
      return;
    }

    const medicines = prescription.medicines
      .map((m, i) => `${i + 1}. ${m.name} - ${m.dosage} (${m.duration})`)
      .join("\n");

    const investigationsText = investigations.length > 0 
      ? `\n\n🔬 *Investigations:*\n${investigations.map(inv => `• ${inv.name}`).join("\n")}`
      : "";

    const message = `
🏥 *Prescription*
Dr. ${profile?.full_name || "Doctor"}
${profile?.specialization ? `${profile.specialization}\n` : ""}
📅 Date: ${format(new Date(prescription.created_at), "dd/MM/yyyy")}

👤 *Patient:* ${prescription.patient?.name}
${prescription.patient?.age ? `Age: ${prescription.patient.age} yrs` : ""}
${prescription.patient?.gender ? `Gender: ${prescription.patient.gender}` : ""}

💊 *Medicines:*
${medicines}
${investigationsText}
${prescription.advice ? `\n📝 *Advice:*\n${prescription.advice}` : ""}
${prescription.next_visit_date ? `\n📆 *Next Visit:* ${format(new Date(prescription.next_visit_date), "dd/MM/yyyy")}` : ""}

_This is a digital prescription from ChamberBox_
    `.trim();

    const phone = prescription.patient.phone.startsWith("0")
      ? "880" + prescription.patient.phone.slice(1)
      : prescription.patient.phone;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prescription Details</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                <Share2 className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="bg-white text-black p-6 rounded-lg border print:border-0">
          {/* Header */}
          <div className="header text-center border-b-2 border-foreground pb-4 mb-4">
            <h1 className="text-xl font-bold">{profile?.full_name || "Doctor Name"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.specialization}</p>
            <p className="text-sm text-muted-foreground">BMDC Reg: {profile?.bmdc_number}</p>
            {profile?.degrees && profile.degrees.length > 0 && (
              <p className="text-xs text-muted-foreground">{profile.degrees.join(", ")}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{profile?.chamber_address}</p>
          </div>

          {/* Patient Info */}
          <div className="patient-info flex justify-between text-sm border-b pb-3 mb-4">
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">Patient: </span>
                <span className="font-medium">{prescription.patient?.name}</span>
              </div>
              <div className="flex gap-4">
                {prescription.patient?.age && (
                  <span>
                    <span className="text-muted-foreground">Age: </span>
                    {prescription.patient.age} yrs
                  </span>
                )}
                {prescription.patient?.gender && (
                  <span>
                    <span className="text-muted-foreground">Sex: </span>
                    <span className="capitalize">{prescription.patient.gender}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div>
                <span className="text-muted-foreground">Date: </span>
                {format(new Date(prescription.created_at), "dd/MM/yyyy")}
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                {prescription.patient?.phone}
              </div>
            </div>
          </div>

          {/* Investigations */}
          {investigations.length > 0 && (
            <div className="section mb-4">
              <div className="section-title font-bold mb-2">🔬 Investigations</div>
              <div className="flex flex-wrap gap-1">
                {investigations.map((inv, i) => (
                  <span
                    key={i}
                    className="investigation-item bg-muted px-2 py-1 rounded text-sm"
                  >
                    {inv.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medicines */}
          <div className="section mb-4">
            <div className="section-title font-bold text-lg mb-3 flex items-center gap-2">
              <span className="rx text-2xl">℞</span> Medicines
            </div>
            {prescription.medicines.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2">
                {prescription.medicines.map((med, i) => (
                  <li key={i} className="medicine-item text-sm">
                    <span className="medicine-name font-semibold">{med.name}</span>
                    <div className="medicine-details text-muted-foreground ml-5">
                      {med.dosage} — {med.duration}
                      {med.instructions && ` (${med.instructions})`}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground italic">No medicines prescribed</p>
            )}
          </div>

          {/* Advice */}
          {prescription.advice && (
            <div className="section mb-4 border-t pt-4">
              <div className="section-title font-bold mb-2">📝 Advice</div>
              <p className="advice text-sm whitespace-pre-line">{prescription.advice}</p>
            </div>
          )}

          {/* Next Visit */}
          {prescription.next_visit_date && (
            <div className="next-visit text-sm border-t pt-3">
              <span className="text-muted-foreground">📆 Next Visit: </span>
              <span className="font-medium">
                {format(new Date(prescription.next_visit_date), "dd MMMM yyyy")}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
