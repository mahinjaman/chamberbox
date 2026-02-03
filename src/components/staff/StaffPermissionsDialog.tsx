import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield, RotateCcw } from "lucide-react";
import { StaffMember, StaffRole } from "@/hooks/useStaff";
import { getPermissionsForRole, StaffPermissions } from "@/lib/staff-permissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StaffPermissionsDialogProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomPermissions {
  use_custom: boolean;
  can_manage_queue: boolean | null;
  can_view_patient_list: boolean | null;
  can_add_patients: boolean | null;
  can_edit_patients: boolean | null;
  can_view_prescriptions: boolean | null;
  can_view_finances: boolean | null;
  can_manage_staff: boolean | null;
  can_manage_integrations: boolean | null;
  can_view_settings: boolean | null;
  can_manage_chambers: boolean | null;
}

const permissionLabels = {
  en: {
    can_manage_queue: "Manage Queue",
    can_view_patient_list: "View Patient List",
    can_add_patients: "Add Patients",
    can_edit_patients: "Edit Patients",
    can_view_prescriptions: "View Prescriptions",
    can_view_finances: "View Finances",
    can_manage_staff: "Manage Staff",
    can_manage_integrations: "Manage Integrations",
    can_view_settings: "View Settings",
    can_manage_chambers: "Manage Chambers",
  },
  bn: {
    can_manage_queue: "কিউ ম্যানেজ",
    can_view_patient_list: "রোগী তালিকা দেখা",
    can_add_patients: "রোগী যোগ করা",
    can_edit_patients: "রোগী সম্পাদনা",
    can_view_prescriptions: "প্রেসক্রিপশন দেখা",
    can_view_finances: "আর্থিক তথ্য দেখা",
    can_manage_staff: "স্টাফ ম্যানেজ",
    can_manage_integrations: "ইন্টিগ্রেশন ম্যানেজ",
    can_view_settings: "সেটিংস দেখা",
    can_manage_chambers: "চেম্বার ম্যানেজ",
  },
};

const permissionDescriptions = {
  en: {
    can_manage_queue: "Add patients to queue, call patients",
    can_view_patient_list: "View list of all patients",
    can_add_patients: "Create new patient records",
    can_edit_patients: "Edit existing patient information",
    can_view_prescriptions: "View prescriptions (read-only)",
    can_view_finances: "View financial data and transactions",
    can_manage_staff: "Add, edit, remove other staff members",
    can_manage_integrations: "Configure WhatsApp and notification settings",
    can_view_settings: "View subscription and usage information",
    can_manage_chambers: "Manage chamber settings and availability",
  },
  bn: {
    can_manage_queue: "কিউতে রোগী যোগ, রোগী কল করা",
    can_view_patient_list: "সব রোগীর তালিকা দেখা",
    can_add_patients: "নতুন রোগী তৈরি করা",
    can_edit_patients: "রোগীর তথ্য সম্পাদনা করা",
    can_view_prescriptions: "প্রেসক্রিপশন দেখা (শুধু পড়া)",
    can_view_finances: "আর্থিক তথ্য এবং লেনদেন দেখা",
    can_manage_staff: "অন্যান্য স্টাফ যোগ, সম্পাদনা, অপসারণ",
    can_manage_integrations: "WhatsApp এবং নোটিফিকেশন সেটআপ",
    can_view_settings: "সাবস্ক্রিপশন এবং ব্যবহার তথ্য দেখা",
    can_manage_chambers: "চেম্বার সেটিংস এবং সময়সূচী ম্যানেজ",
  },
};

const roleLabels = {
  receptionist: { en: "Receptionist", bn: "রিসেপশনিস্ট" },
  assistant: { en: "Assistant", bn: "সহকারী" },
  manager: { en: "Manager", bn: "ম্যানেজার" },
};

export const StaffPermissionsDialog = ({
  staff,
  open,
  onOpenChange,
}: StaffPermissionsDialogProps) => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<CustomPermissions>({
    use_custom: false,
    can_manage_queue: null,
    can_view_patient_list: null,
    can_add_patients: null,
    can_edit_patients: null,
    can_view_prescriptions: null,
    can_view_finances: null,
    can_manage_staff: null,
    can_manage_integrations: null,
    can_view_settings: null,
    can_manage_chambers: null,
  });

  const roleDefaults = staff ? getPermissionsForRole(staff.role as StaffRole) : null;

  // Load existing custom permissions
  useEffect(() => {
    if (!staff?.id || !open) return;

    const loadPermissions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("staff_custom_permissions")
          .select("*")
          .eq("staff_id", staff.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setCustomPermissions({
            use_custom: data.use_custom ?? false,
            can_manage_queue: data.can_manage_queue,
            can_view_patient_list: data.can_view_patient_list,
            can_add_patients: data.can_add_patients,
            can_edit_patients: data.can_edit_patients,
            can_view_prescriptions: data.can_view_prescriptions,
            can_view_finances: data.can_view_finances,
            can_manage_staff: data.can_manage_staff,
            can_manage_integrations: data.can_manage_integrations,
            can_view_settings: data.can_view_settings,
            can_manage_chambers: data.can_manage_chambers,
          });
        } else {
          // Initialize with role defaults
          setCustomPermissions({
            use_custom: false,
            can_manage_queue: null,
            can_view_patient_list: null,
            can_add_patients: null,
            can_edit_patients: null,
            can_view_prescriptions: null,
            can_view_finances: null,
            can_manage_staff: null,
            can_manage_integrations: null,
            can_view_settings: null,
            can_manage_chambers: null,
          });
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [staff?.id, open]);

  const getEffectiveValue = (key: keyof StaffPermissions): boolean => {
    const customKey = `can_${key.replace("can", "").toLowerCase()}` as keyof CustomPermissions;
    const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase() as keyof CustomPermissions;
    
    if (customPermissions.use_custom && customPermissions[snakeCaseKey] !== null) {
      return customPermissions[snakeCaseKey] as boolean;
    }
    return roleDefaults?.[key] ?? false;
  };

  const handleToggle = (key: string, value: boolean) => {
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!staff?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("staff_custom_permissions")
        .upsert({
          staff_id: staff.id,
          ...customPermissions,
        }, { onConflict: "staff_id" });

      if (error) throw error;

      toast.success(language === "bn" ? "অনুমতি সংরক্ষিত হয়েছে" : "Permissions saved");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staffInfo"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setCustomPermissions({
      use_custom: false,
      can_manage_queue: null,
      can_view_patient_list: null,
      can_add_patients: null,
      can_edit_patients: null,
      can_view_prescriptions: null,
      can_view_finances: null,
      can_manage_staff: null,
      can_manage_integrations: null,
      can_view_settings: null,
      can_manage_chambers: null,
    });
  };

  const permissionKeys = [
    "can_manage_queue",
    "can_view_patient_list",
    "can_add_patients",
    "can_edit_patients",
    "can_view_prescriptions",
    "can_view_finances",
    "can_manage_staff",
    "can_manage_integrations",
    "can_view_settings",
    "can_manage_chambers",
  ] as const;

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {language === "bn" ? "অনুমতি ম্যানেজ করুন" : "Manage Permissions"}
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{staff.full_name}</span>
            <Badge variant="secondary" className="ml-2">
              {roleLabels[staff.role]?.[language] || staff.role}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <Label className="font-medium">
                  {language === "bn" ? "কাস্টম অনুমতি ব্যবহার করুন" : "Use Custom Permissions"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "bn"
                    ? "Role এর ডিফল্ট অনুমতি override করুন"
                    : "Override default role permissions"}
                </p>
              </div>
              <Switch
                checked={customPermissions.use_custom}
                onCheckedChange={(checked) =>
                  handleToggle("use_custom", checked)
                }
              />
            </div>

            {customPermissions.use_custom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefault}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {language === "bn" ? "ডিফল্টে রিসেট করুন" : "Reset to Role Defaults"}
              </Button>
            )}

            <Separator />

            {/* Permission Toggles */}
            <div className="space-y-3">
              {permissionKeys.map((key) => {
                const roleDefaultKey = key.replace(/_([a-z])/g, (_, letter) =>
                  letter.toUpperCase()
                ) as keyof StaffPermissions;
                const roleDefault = roleDefaults?.[roleDefaultKey] ?? false;
                const currentValue = customPermissions.use_custom
                  ? (customPermissions[key] ?? roleDefault)
                  : roleDefault;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      customPermissions.use_custom
                        ? "bg-background"
                        : "bg-muted/30 opacity-75"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">
                          {permissionLabels[language]?.[key] || key}
                        </Label>
                        {!customPermissions.use_custom && (
                          <Badge variant="outline" className="text-xs">
                            {language === "bn" ? "ডিফল্ট" : "Default"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {permissionDescriptions[language]?.[key] || ""}
                      </p>
                    </div>
                    <Switch
                      checked={currentValue}
                      onCheckedChange={(checked) => {
                        if (customPermissions.use_custom) {
                          handleToggle(key, checked);
                        }
                      }}
                      disabled={!customPermissions.use_custom}
                    />
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."}
                  </>
                ) : (
                  language === "bn" ? "সংরক্ষণ করুন" : "Save Permissions"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
