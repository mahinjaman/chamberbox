import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff, StaffRole } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { permissionDescriptions } from "@/lib/staff-permissions";
import { Building2, Info } from "lucide-react";

interface Chamber {
  id: string;
  name: string;
  address: string;
}

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chambers: Chamber[];
}

export function AddStaffDialog({ open, onOpenChange, chambers }: AddStaffDialogProps) {
  const { language } = useLanguage();
  const { addStaff, isAddingStaff } = useStaff();
  
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "receptionist" as StaffRole,
    chamber_ids: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStaff({
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      role: formData.role,
      chamber_ids: formData.chamber_ids,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          email: "",
          full_name: "",
          phone: "",
          role: "receptionist",
          chamber_ids: [],
        });
      },
    });
  };

  const toggleChamber = (chamberId: string) => {
    setFormData(prev => ({
      ...prev,
      chamber_ids: prev.chamber_ids.includes(chamberId)
        ? prev.chamber_ids.filter(id => id !== chamberId)
        : [...prev.chamber_ids, chamberId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === "bn" ? "নতুন স্টাফ যোগ করুন" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              {language === "bn" ? "পুরো নাম" : "Full Name"} *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={language === "bn" ? "স্টাফের নাম" : "Staff name"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {language === "bn" ? "ইমেইল" : "Email"} *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              {language === "bn" 
                ? "স্টাফ এই ইমেইল দিয়ে সাইন আপ করে লগইন করতে পারবে"
                : "Staff will sign up with this email to login"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {language === "bn" ? "ফোন" : "Phone"}
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              {language === "bn" ? "ভূমিকা" : "Role"} *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: StaffRole) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receptionist">
                  {language === "bn" ? "রিসেপশনিস্ট" : "Receptionist"}
                </SelectItem>
                <SelectItem value="assistant">
                  {language === "bn" ? "সহকারী" : "Assistant"}
                </SelectItem>
                <SelectItem value="manager">
                  {language === "bn" ? "ম্যানেজার" : "Manager"}
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Show permissions for selected role */}
            <div className="bg-muted/50 rounded-md p-3 mt-2">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                <Info className="w-3 h-3" />
                {language === "bn" ? "এই ভূমিকার অনুমতি:" : "Permissions for this role:"}
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {permissionDescriptions[language][formData.role].map((perm, idx) => (
                  <li key={idx}>• {perm}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {language === "bn" ? "চেম্বার অ্যাক্সেস" : "Chamber Access"} *
            </Label>
            {chambers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {language === "bn" 
                  ? "প্রথমে একটি চেম্বার যোগ করুন"
                  : "Please add a chamber first"}
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {chambers.map((chamber) => (
                  <label
                    key={chamber.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.chamber_ids.includes(chamber.id)}
                      onCheckedChange={() => toggleChamber(chamber.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{chamber.name}</p>
                        <p className="text-xs text-muted-foreground">{chamber.address}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
              disabled={isAddingStaff || !formData.email || !formData.full_name || formData.chamber_ids.length === 0}
            >
              {isAddingStaff 
                ? (language === "bn" ? "যোগ হচ্ছে..." : "Adding...")
                : (language === "bn" ? "স্টাফ যোগ করুন" : "Add Staff")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
