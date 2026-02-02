import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QueueToken } from "@/hooks/useQueue";
import { User, Phone, Calendar, Clock, FileText, Hash } from "lucide-react";

interface PatientDetailDialogProps {
  token: QueueToken | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatientDetailDialog = ({
  token,
  open,
  onOpenChange,
}: PatientDetailDialogProps) => {
  if (!token) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              #{token.token_number}
            </div>
            <div>
              <span>{token.patient?.name}</span>
              <p className="text-sm font-normal text-muted-foreground">
                Queue Position #{token.token_number}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Reference */}
          {token.serial_number && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Hash className="w-4 h-4" />
                <span>Booking Reference</span>
              </div>
              <p className="font-mono font-bold text-primary text-lg">
                {token.serial_number}
              </p>
            </div>
          )}

          {/* Patient Info */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{token.patient?.phone}</p>
              </div>
            </div>

            {(token.patient?.age || token.patient?.gender) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Age & Gender</p>
                  <p className="font-medium">
                    {token.patient.age ? `${token.patient.age} yrs` : ""}
                    {token.patient.age && token.patient.gender ? ", " : ""}
                    {token.patient.gender || ""}
                  </p>
                </div>
              </div>
            )}

            {token.patient?.blood_group && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground text-sm">🩸</span>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{token.patient.blood_group}</p>
                </div>
              </div>
            )}
          </div>

          {/* Visiting Reason */}
          {token.visiting_reason && (
            <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Visiting Reason</span>
              </div>
              <p className="text-foreground">{token.visiting_reason}</p>
            </div>
          )}

          {/* Booking Details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Queue Date</p>
                <p className="font-medium text-sm">{token.queue_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Booked Via</p>
                <Badge variant="outline" className="mt-0.5 capitalize">
                  {token.booked_by}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant={
                token.status === "completed"
                  ? "default"
                  : token.status === "current"
                  ? "default"
                  : token.status === "cancelled"
                  ? "destructive"
                  : "secondary"
              }
              className={
                token.status === "current"
                  ? "bg-success text-success-foreground"
                  : token.status === "completed"
                  ? "bg-primary"
                  : ""
              }
            >
              {token.status === "current"
                ? "Now Serving"
                : token.status.charAt(0).toUpperCase() + token.status.slice(1)}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
