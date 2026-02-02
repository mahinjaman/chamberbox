import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff, StaffMember, StaffRole } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { permissionDescriptions } from "@/lib/staff-permissions";
import { Building2, Info } from "lucide-react";

interface Chamber {
  id: string;
  name: string;
  address: string;
}

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  chambers: Chamber[];
}

export function EditStaffDialog({ open, onOpenChange, staff, chambers }: EditStaffDialogProps) {
  const { language } = useLanguage();
  const { updateStaff, isUpdatingStaff } = useStaff();
  
  const [formData, setFormData] = useState({
    full_name: staff.full_name,
    phone: staff.phone || "",
    role: staff.role,
    is_active: staff.is_active,
    chamber_ids: staff.chamber_access?.map(a => a.chamber_id) || [],
  });

  useEffect(() => {
    setFormData({
      full_name: staff.full_name,
      phone: staff.phone || "",
      role: staff.role,
      is_active: staff.is_active,
      chamber_ids: staff.chamber_access?.map(a => a.chamber_id) || [],
    });
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateStaff({
      staffId: staff.id,
      updates: {
        full_name: formData.full_name,
        phone: formData.phone || null,
        role: formData.role,
        is_active: formData.is_active,
      },
      chamberIds: formData.chamber_ids,
    }, {
      onSuccess: () => {
        onOpenChange(false);
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
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "bn" ? "স্টাফ সম্পাদনা" : "Edit Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two column grid for desktop */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_full_name" className="text-sm">
                {language === "bn" ? "পুরো নাম" : "Full Name"} *
              </Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{language === "bn" ? "ইমেইল" : "Email"}</Label>
              <Input value={staff.email} disabled className="bg-muted h-9 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_phone" className="text-sm">
                {language === "bn" ? "ফোন" : "Phone"}
              </Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_role" className="text-sm">
                {language === "bn" ? "ভূমিকা" : "Role"} *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: StaffRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-9">
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
            </div>
          </div>

          {/* Permissions inline */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>{permissionDescriptions[language][formData.role].join(" • ")}</span>
          </div>

          {/* Active status and Chamber access side by side */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label className="text-sm">{language === "bn" ? "সক্রিয়" : "Active"}</Label>
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "লগইন অনুমতি" : "Login access"}
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">
                {language === "bn" ? "চেম্বার" : "Chambers"} *
              </Label>
              <div className="space-y-1 max-h-24 overflow-y-auto border rounded-md p-2">
                {chambers.map((chamber) => (
                  <label
                    key={chamber.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={formData.chamber_ids.includes(chamber.id)}
                      onCheckedChange={() => toggleChamber(chamber.id)}
                    />
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{chamber.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={isUpdatingStaff || !formData.full_name || formData.chamber_ids.length === 0}
            >
              {isUpdatingStaff 
                ? (language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...")
                : (language === "bn" ? "সংরক্ষণ করুন" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
