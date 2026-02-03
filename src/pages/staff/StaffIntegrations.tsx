import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageCircle, Bell, Save } from "lucide-react";
import { toast } from "sonner";

export default function StaffIntegrations() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("whatsapp");

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch integration settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["staff_integration_settings", doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      
      const { data, error } = await supabase
        .from("integration_settings")
        .select("*")
        .eq("doctor_id", doctorId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  const [formData, setFormData] = useState({
    whatsapp_enabled: false,
    whatsapp_number: "",
    whatsapp_api_provider: "aisensy",
    whatsapp_api_key: "",
    send_booking_confirmation: true,
    send_reminder_before: true,
    reminder_hours_before: 2,
    confirmation_template: "",
    reminder_template: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_enabled: settings.whatsapp_enabled || false,
        whatsapp_number: settings.whatsapp_number || "",
        whatsapp_api_provider: settings.whatsapp_api_provider || "aisensy",
        whatsapp_api_key: settings.whatsapp_api_key || "",
        send_booking_confirmation: settings.send_booking_confirmation ?? true,
        send_reminder_before: settings.send_reminder_before ?? true,
        reminder_hours_before: settings.reminder_hours_before || 2,
        confirmation_template: settings.confirmation_template || "",
        reminder_template: settings.reminder_template || "",
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!doctorId) throw new Error("No doctor ID");

      const { error } = await supabase
        .from("integration_settings")
        .upsert({
          doctor_id: doctorId,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_integration_settings"] });
      toast.success(language === "bn" ? "সেটিংস সংরক্ষিত" : "Settings saved");
    },
    onError: (error) => {
      toast.error(language === "bn" ? "সংরক্ষণ ব্যর্থ" : "Failed to save");
    },
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canManageIntegrations) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading || isLoading) {
    return (
      <StaffLayout title={language === "bn" ? "ইন্টিগ্রেশন" : "Integrations"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canManageIntegrations) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  return (
    <StaffLayout
      title={language === "bn" ? "ইন্টিগ্রেশন সেটিংস" : "Integration Settings"}
      description={language === "bn" ? "এক্সটার্নাল সার্ভিস কানেক্ট করুন" : "Connect external services"}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === "bn" ? "নোটিফিকেশন" : "Notifications"}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {language === "bn" ? "হোয়াটসঅ্যাপ সেটিংস" : "WhatsApp Settings"}
                </CardTitle>
                <CardDescription>
                  {language === "bn" 
                    ? "হোয়াটসঅ্যাপ নোটিফিকেশন কনফিগার করুন" 
                    : "Configure WhatsApp notifications"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === "bn" ? "হোয়াটসঅ্যাপ সক্রিয়" : "Enable WhatsApp"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" 
                        ? "রোগীদের হোয়াটসঅ্যাপ নোটিফিকেশন পাঠান" 
                        : "Send WhatsApp notifications to patients"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={formData.whatsapp_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, whatsapp_enabled: checked })
                    }
                  />
                </div>

                {formData.whatsapp_enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>{language === "bn" ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}</Label>
                      <Input
                        placeholder="+880XXXXXXXXXX"
                        value={formData.whatsapp_number}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsapp_number: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === "bn" ? "API কী" : "API Key"}</Label>
                      <Input
                        type="password"
                        placeholder="Enter API key"
                        value={formData.whatsapp_api_key}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsapp_api_key: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {language === "bn" ? "সংরক্ষণ করুন" : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="notifications">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {language === "bn" ? "নোটিফিকেশন সেটিংস" : "Notification Settings"}
                </CardTitle>
                <CardDescription>
                  {language === "bn" 
                    ? "অটোমেটিক নোটিফিকেশন কনফিগার করুন" 
                    : "Configure automatic notifications"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === "bn" ? "বুকিং কনফার্মেশন" : "Booking Confirmation"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" 
                        ? "বুকিং এর পর কনফার্মেশন পাঠান" 
                        : "Send confirmation after booking"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={formData.send_booking_confirmation}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, send_booking_confirmation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === "bn" ? "রিমাইন্ডার" : "Reminder"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "bn" 
                        ? "অ্যাপয়েন্টমেন্টের আগে রিমাইন্ডার পাঠান" 
                        : "Send reminder before appointment"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={formData.send_reminder_before}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, send_reminder_before: checked })
                    }
                  />
                </div>

                {formData.send_reminder_before && (
                  <div className="space-y-2">
                    <Label>
                      {language === "bn" ? "কত ঘন্টা আগে" : "Hours Before"}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={48}
                      value={formData.reminder_hours_before}
                      onChange={(e) =>
                        setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) || 2 })
                      }
                    />
                  </div>
                )}

                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {language === "bn" ? "সংরক্ষণ করুন" : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </StaffLayout>
  );
}