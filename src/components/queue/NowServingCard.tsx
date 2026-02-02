import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueueToken } from "@/hooks/useQueue";
import {
  FileText,
  Banknote,
  XCircle,
  CheckCircle2,
  Eye,
  AlertTriangle,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NowServingCardProps {
  token: QueueToken;
  onMakePrescription: () => void;
  onViewPrescription: (prescriptionId: string) => void;
  onCollectPayment: () => void;
  onCancel: () => void;
  onCallNext: (skipIncomplete?: boolean) => Promise<{ incomplete: boolean; hasPrescription?: boolean; hasPayment?: boolean }>;
  onCompleteOnly: () => void;
}

export const NowServingCard = ({
  token,
  onMakePrescription,
  onViewPrescription,
  onCollectPayment,
  onCancel,
  onCallNext,
  onCompleteOnly,
}: NowServingCardProps) => {
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [incompleteState, setIncompleteState] = useState<{
    hasPrescription: boolean;
    hasPayment: boolean;
  }>({ hasPrescription: false, hasPayment: false });

  const hasPrescription = !!token.prescription_id;
  const hasPayment = token.payment_collected;
  const isFullyComplete = hasPrescription && hasPayment;

  const handleCallNextClick = async () => {
    const result = await onCallNext(false);
    if (result.incomplete) {
      setIncompleteState({
        hasPrescription: result.hasPrescription ?? false,
        hasPayment: result.hasPayment ?? false,
      });
      setShowIncompleteDialog(true);
    }
  };

  const handleForceCallNext = async () => {
    setShowIncompleteDialog(false);
    await onCallNext(true);
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping"></div>
              </div>
              <CardTitle className="text-base">Now Serving</CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onCancel}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center text-success-foreground shadow-lg">
              <span className="text-2xl font-bold">#{token.token_number}</span>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-foreground">
                {token.patient?.name}
              </p>
              <p className="text-muted-foreground">{token.patient?.phone}</p>
              {token.patient?.age && (
                <p className="text-sm text-muted-foreground">
                  {token.patient.age} yrs, {token.patient.gender}
                </p>
              )}
              {token.serial_number && (
                <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                  Ref: {token.serial_number}
                </p>
              )}
            </div>
          </div>

          {/* Visiting Reason */}
          {token.visiting_reason && (
            <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-1">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Visiting Reason</span>
              </div>
              <p className="text-foreground text-sm">{token.visiting_reason}</p>
            </div>
          )}

          {/* Workflow Steps */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Step 1: Prescription */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                hasPrescription
                  ? "border-success/50 bg-success/5"
                  : "border-dashed border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className={cn("w-5 h-5", hasPrescription ? "text-success" : "text-muted-foreground")} />
                  <span className="font-medium">Prescription</span>
                </div>
                {hasPrescription && (
                  <Badge className="bg-success/20 text-success border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
              {hasPrescription ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => token.prescription_id && onViewPrescription(token.prescription_id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Prescription
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={onMakePrescription}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Make Prescription
                </Button>
              )}
            </div>

            {/* Step 2: Payment */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                hasPayment
                  ? "border-success/50 bg-success/5"
                  : "border-dashed border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Banknote className={cn("w-5 h-5", hasPayment ? "text-success" : "text-muted-foreground")} />
                  <span className="font-medium">Payment</span>
                </div>
                {hasPayment && (
                  <Badge className="bg-success/20 text-success border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    ৳{token.payment_amount}
                  </Badge>
                )}
              </div>
              {hasPayment ? (
                <div className="text-sm text-muted-foreground text-center py-2">
                  Collected via {token.payment_method}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={onCollectPayment}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Collect Payment
                </Button>
              )}
            </div>
          </div>

          {/* Complete Status & Call Next */}
          <div className="pt-2 border-t space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-success text-success hover:bg-success/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompleteOnly();
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Only
              </Button>
              <Button
                className={cn(
                  isFullyComplete
                    ? "bg-success hover:bg-success/90"
                    : "bg-warning hover:bg-warning/90 text-warning-foreground"
                )}
                onClick={handleCallNextClick}
              >
                {isFullyComplete ? (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Call Next
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Call Next
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Tasks Dialog */}
      <Dialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Incomplete Tasks
            </DialogTitle>
            <DialogDescription>
              The following tasks are not completed for {token.patient?.name}:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {!incompleteState.hasPrescription && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span>Prescription not created</span>
              </div>
            )}
            {!incompleteState.hasPayment && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Banknote className="w-5 h-5 text-muted-foreground" />
                <span>Payment not collected</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowIncompleteDialog(false)}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleForceCallNext}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip & Call Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
