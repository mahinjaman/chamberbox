import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Loader2, AlertTriangle, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddPatientDialog = ({ open, onOpenChange, onSuccess }: AddPatientDialogProps) => {
  const { checkLimit, isExpired } = useFeatureAccess();
  const patientLimit = checkLimit("patients");
  const { addPatient, isAdding } = usePatients();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "" as "male" | "female" | "",
    blood_group: "",
    address: "",
  });
  const [errors, setErrors] = useState<{ age?: string; gender?: string }>({});

  const resetForm = () => {
    setFormData({ name: "", phone: "", age: "", gender: "", blood_group: "", address: "" });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { age?: string; gender?: string } = {};
    if (!formData.age || parseInt(formData.age) <= 0) newErrors.age = "Age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    addPatient(
      {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        age: parseInt(formData.age),
        gender: formData.gender as "male" | "female",
        blood_group: formData.blood_group || null,
        address: formData.address.trim() || null,
        allergies: null,
        chronic_conditions: null,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Limit reached
  if (!patientLimit.withinLimit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isExpired ? "Subscription Expired" : "Patient Limit Reached"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md text-sm">
              {patientLimit.message}
            </p>
            <Button asChild>
              <Link to="/dashboard/settings">
                <Crown className="w-4 h-4 mr-2" />
                {isExpired ? "Renew Subscription" : "Upgrade Plan"}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's details. Name, phone, age and gender are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dialog-name">Full Name *</Label>
              <Input
                id="dialog-name"
                placeholder="Patient's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-phone">Phone Number *</Label>
              <Input
                id="dialog-phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-age">Age *</Label>
              <Input
                id="dialog-age"
                type="number"
                placeholder="Age in years"
                min="1"
                max="150"
                value={formData.age}
                onChange={(e) => {
                  setFormData({ ...formData, age: e.target.value });
                  if (errors.age) setErrors({ ...errors, age: undefined });
                }}
                required
                className={errors.age ? "border-destructive" : ""}
              />
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData({ ...formData, gender: value as "male" | "female" });
                  if (errors.gender) setErrors({ ...errors, gender: undefined });
                }}
              >
                <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-blood">Blood Group</Label>
              <Select
                value={formData.blood_group}
                onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-address">Address</Label>
            <Textarea
              id="dialog-address"
              placeholder="Patient's address (optional)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding} className="flex-1">
              {isAdding ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
              ) : (
                "Add Patient"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
