import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Users, FileText, MessageSquare, Building2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function StaffSettings() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch profile with subscription info
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["staff_doctor_profile", doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", doctorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Fetch subscription plan
  const { data: currentPlan } = useQuery({
    queryKey: ["staff_subscription_plan", profile?.subscription_tier],
    queryFn: async () => {
      if (!profile?.subscription_tier) return null;
      
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("tier", profile.subscription_tier)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.subscription_tier,
  });

  // Fetch usage
  const { data: usage } = useQuery({
    queryKey: ["staff_subscription_usage", doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      
      const { data, error } = await supabase
        .from("subscription_usage")
        .select("*")
        .eq("doctor_id", doctorId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Fetch staff count
  const { data: staffMembers } = useQuery({
    queryKey: ["staff_members_count", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("staff_members")
        .select("id")
        .eq("doctor_id", doctorId);

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Fetch chambers count
  const { data: chambers } = useQuery({
    queryKey: ["staff_chambers_count", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("chambers")
        .select("id")
        .eq("doctor_id", doctorId);

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewSettings) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  const isLoading = staffInfoLoading || profileLoading;

  if (isLoading) {
    return (
      <StaffLayout title={language === "bn" ? "সেটিংস" : "Settings"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewSettings) {
    return null;
  }

  const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const daysRemaining = expiresAt ? differenceInDays(expiresAt, new Date()) : null;

  const formatLimit = (value: number | null | undefined) => 
    value === -1 || value === null || value === undefined ? "Unlimited" : value.toLocaleString();

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const staffCount = staffMembers?.length || 0;
  const chamberCount = chambers?.length || 0;

  return (
    <StaffLayout
      title={language === "bn" ? "সেটিংস" : "Settings"}
      description={language === "bn" ? "সাবস্ক্রিপশন ও ব্যবহার দেখুন" : "View subscription and usage"}
    >
      <div className="max-w-3xl space-y-6">
        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  {language === "bn" ? "সাবস্ক্রিপশন" : "Subscription"}
                </CardTitle>
                <CardDescription>
                  {language === "bn" ? "বর্তমান প্ল্যান ও ব্যবহার" : "Current plan and usage"}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isExpired ? "destructive" : "default"} 
                    className="capitalize text-sm"
                  >
                    {profile?.subscription_tier || "trial"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {language === "bn" ? "রোগী" : "Patients"}
                  </span>
                  <span>{usage?.total_patients || 0} / {formatLimit(currentPlan?.max_patients)}</span>
                </div>
                {currentPlan?.max_patients && currentPlan.max_patients !== -1 && (
                  <Progress 
                    value={((usage?.total_patients || 0) / currentPlan.max_patients) * 100} 
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {language === "bn" ? "প্রেসক্রিপশন/মাস" : "Prescriptions/Month"}
                  </span>
                  <span>{usage?.prescriptions_this_month || 0} / {formatLimit(currentPlan?.max_prescriptions_per_month)}</span>
                </div>
                {currentPlan?.max_prescriptions_per_month && currentPlan.max_prescriptions_per_month !== -1 && (
                  <Progress 
                    value={((usage?.prescriptions_this_month || 0) / currentPlan.max_prescriptions_per_month) * 100} 
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {language === "bn" ? "SMS ক্রেডিট" : "SMS Credits"}
                  </span>
                  <span>{usage?.sms_sent_this_month || 0} / {formatLimit(currentPlan?.sms_credits)}</span>
                </div>
                {currentPlan?.sms_credits && currentPlan.sms_credits !== -1 && (
                  <Progress 
                    value={((usage?.sms_sent_this_month || 0) / currentPlan.sms_credits) * 100} 
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {language === "bn" ? "চেম্বার" : "Chambers"}
                  </span>
                  <span>{chamberCount} / {formatLimit(currentPlan?.max_chambers)}</span>
                </div>
                {currentPlan?.max_chambers && currentPlan.max_chambers !== -1 && (
                  <Progress 
                    value={(chamberCount / currentPlan.max_chambers) * 100} 
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {language === "bn" ? "স্টাফ" : "Staff"}
                  </span>
                  <span>{staffCount} / {formatLimit(currentPlan?.max_staff)}</span>
                </div>
                {currentPlan?.max_staff && currentPlan.max_staff !== -1 && (
                  <Progress 
                    value={(staffCount / currentPlan.max_staff) * 100} 
                    className="h-2"
                  />
                )}
              </div>

              {/* Subscription Expiry */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  {language === "bn" ? "মেয়াদ" : "Validity"}
                </div>
                {expiresAt ? (
                  <>
                    {isExpired ? (
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertTriangle className="w-3 h-3" />
                        {language === "bn" ? "মেয়াদ শেষ" : "Expired"}
                      </div>
                    ) : daysRemaining !== null && daysRemaining <= 7 ? (
                      <div className="flex items-center gap-1 text-warning text-sm">
                        <AlertTriangle className="w-3 h-3" />
                        {daysRemaining} {language === "bn" ? "দিন বাকি" : "days left"}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-success text-sm">
                        <CheckCircle className="w-3 h-3" />
                        {daysRemaining} {language === "bn" ? "দিন বাকি" : "days left"}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {isExpired ? (language === "bn" ? 'শেষ হয়েছে' : 'Expired on') : (language === "bn" ? 'শেষ হবে' : 'Expires')}: {format(expiresAt, 'dd MMM yyyy')}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="w-3 h-3" />
                    {language === "bn" ? "মেয়াদ নির্ধারিত নেই" : "No expiry set"}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">
                {language === "bn" ? "অন্তর্ভুক্ত ফিচার" : "Included Features"}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentPlan?.can_use_public_profile && (
                  <Badge variant="outline">
                    {language === "bn" ? "পাবলিক প্রোফাইল" : "Public Profile"}
                  </Badge>
                )}
                {currentPlan?.can_use_queue_booking && (
                  <Badge variant="outline">
                    {language === "bn" ? "কিউ বুকিং" : "Queue Booking"}
                  </Badge>
                )}
                {currentPlan?.can_use_whatsapp_notifications && (
                  <Badge variant="outline">
                    {language === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
                  </Badge>
                )}
                {currentPlan?.can_use_analytics && (
                  <Badge variant="outline">
                    {language === "bn" ? "অ্যানালিটিক্স" : "Analytics"}
                  </Badge>
                )}
                {currentPlan?.can_export_data && (
                  <Badge variant="outline">
                    {language === "bn" ? "ডেটা এক্সপোর্ট" : "Data Export"}
                  </Badge>
                )}
                {currentPlan?.can_use_custom_branding && (
                  <Badge variant="outline">
                    {language === "bn" ? "কাস্টম ব্র্যান্ডিং" : "Custom Branding"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {language === "bn" 
                  ? "প্ল্যান আপগ্রেড করতে ডাক্তারের সাথে যোগাযোগ করুন।" 
                  : "Contact the doctor to upgrade the plan."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}