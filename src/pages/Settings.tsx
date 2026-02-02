import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePlanDialog } from "@/components/subscription/UpgradePlanDialog";
import { Loader2, Save, Users, FileText, MessageSquare, Building2, Crown, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const Settings = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { currentPlan, usage, limits, expiresAt, isExpired, daysRemaining, isLoading: subscriptionLoading } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    bmdc_number: "",
    chamber_address: "",
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        specialization: profile.specialization || "",
        bmdc_number: profile.bmdc_number || "",
        chamber_address: profile.chamber_address || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || null,
      specialization: formData.specialization.trim() || null,
      bmdc_number: formData.bmdc_number.trim() || null,
      chamber_address: formData.chamber_address.trim() || null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const formatLimit = (value: number) => value === -1 ? "Unlimited" : value.toLocaleString();

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your profile and subscription"
    >
      <div className="max-w-3xl space-y-6">
        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription>Your current plan and usage</CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isExpired ? "destructive" : "default"} 
                    className="capitalize text-sm"
                  >
                    {currentPlan?.name || profile?.subscription_tier || "Basic"}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                </div>
                {expiresAt && !isExpired && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {daysRemaining} days remaining
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscriptionLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Usage Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Patients */}
                  <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Patients</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usage?.total_patients || 0} / {formatLimit(currentPlan?.max_patients || 0)}
                      </span>
                    </div>
                    {!limits.patients.isUnlimited && (
                      <Progress 
                        value={limits.patients.percentage} 
                        className={`h-2 ${getStatusColor(limits.patients.percentage)}`}
                      />
                    )}
                    {limits.patients.isUnlimited && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Unlimited
                      </div>
                    )}
                  </div>

                  {/* Prescriptions This Month */}
                  <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Prescriptions/Month</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usage?.prescriptions_this_month || 0} / {formatLimit(currentPlan?.max_prescriptions_per_month || 0)}
                      </span>
                    </div>
                    {!limits.prescriptions.isUnlimited && (
                      <Progress 
                        value={limits.prescriptions.percentage} 
                        className={`h-2 ${getStatusColor(limits.prescriptions.percentage)}`}
                      />
                    )}
                    {limits.prescriptions.isUnlimited && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Unlimited
                      </div>
                    )}
                  </div>

                  {/* SMS Credits */}
                  <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">SMS Credits</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usage?.sms_sent_this_month || 0} / {formatLimit(currentPlan?.sms_credits || 0)}
                      </span>
                    </div>
                    {!limits.sms.isUnlimited && (
                      <Progress 
                        value={limits.sms.percentage} 
                        className={`h-2 ${getStatusColor(limits.sms.percentage)}`}
                      />
                    )}
                    {limits.sms.isUnlimited && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Unlimited
                      </div>
                    )}
                  </div>

                  {/* Chambers */}
                  <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Chambers</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Max: {formatLimit(currentPlan?.max_chambers || 0)}
                      </span>
                    </div>
                    {limits.chambers.isUnlimited && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Unlimited
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Included Features</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPlan?.can_use_public_profile && (
                      <Badge variant="outline">Public Profile</Badge>
                    )}
                    {currentPlan?.can_use_queue_booking && (
                      <Badge variant="outline">Queue Booking</Badge>
                    )}
                    {currentPlan?.can_use_whatsapp_notifications && (
                      <Badge variant="outline">WhatsApp Notifications</Badge>
                    )}
                    {currentPlan?.can_use_analytics && (
                      <Badge variant="outline">Analytics</Badge>
                    )}
                    {currentPlan?.can_export_data && (
                      <Badge variant="outline">Data Export</Badge>
                    )}
                    {currentPlan?.can_use_custom_branding && (
                      <Badge variant="outline">Custom Branding</Badge>
                    )}
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>

                <UpgradePlanDialog 
                  open={showUpgradeDialog} 
                  onOpenChange={setShowUpgradeDialog} 
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and professional details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    placeholder="e.g. General Medicine, Cardiology"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bmdc_number">BMDC Registration Number</Label>
                  <Input
                    id="bmdc_number"
                    value={formData.bmdc_number}
                    onChange={(e) =>
                      setFormData({ ...formData, bmdc_number: e.target.value })
                    }
                    placeholder="Your BMDC number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chamber_address">Chamber Address</Label>
                <Textarea
                  id="chamber_address"
                  value={formData.chamber_address}
                  onChange={(e) =>
                    setFormData({ ...formData, chamber_address: e.target.value })
                  }
                  placeholder="Your chamber's full address"
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
