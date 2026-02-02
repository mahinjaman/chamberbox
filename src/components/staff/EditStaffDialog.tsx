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
import { Building2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === "bn" ? "স্টাফ সম্পাদনা" : "Edit Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">
              {language === "bn" ? "পুরো নাম" : "Full Name"} *
            </Label>
            <Input
              id="edit_full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "bn" ? "ইমেইল" : "Email"}</Label>
            <Input value={staff.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              {language === "bn" ? "ইমেইল পরিবর্তন করা যাবে না" : "Email cannot be changed"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_phone">
              {language === "bn" ? "ফোন" : "Phone"}
            </Label>
            <Input
              id="edit_phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_role">
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
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{language === "bn" ? "সক্রিয় স্ট্যাটাস" : "Active Status"}</Label>
              <p className="text-xs text-muted-foreground">
                {language === "bn" 
                  ? "নিষ্ক্রিয় স্টাফ লগইন করতে পারবে না"
                  : "Inactive staff cannot login"}
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {language === "bn" ? "চেম্বার অ্যাক্সেস" : "Chamber Access"} *
            </Label>
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
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
