import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSubscriptionAdmin, SubscriptionPlan } from "@/hooks/useSubscription";
import { 
  Loader2, Edit, Save, Crown, Users, FileText, MessageSquare, 
  Building2, UserPlus, Check, X, Sparkles, Globe, Bell, 
  BarChart3, Download, Palette, Infinity
} from "lucide-react";

export default function PlanConfiguration() {
  const { plans, isLoading, updatePlan } = useSubscriptionAdmin();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({});

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
  };

  const handleSave = () => {
    if (!editingPlan) return;

    updatePlan.mutate({
      tier: editingPlan.tier,
      updates: {
        name: formData.name,
        description: formData.description,
        max_patients: Number(formData.max_patients),
        max_staff: Number(formData.max_staff),
        max_chambers: Number(formData.max_chambers),
        max_prescriptions_per_month: Number(formData.max_prescriptions_per_month),
        sms_credits: Number(formData.sms_credits),
        can_use_public_profile: formData.can_use_public_profile,
        can_use_queue_booking: formData.can_use_queue_booking,
        can_use_whatsapp_notifications: formData.can_use_whatsapp_notifications,
        can_use_analytics: formData.can_use_analytics,
        can_export_data: formData.can_export_data,
        can_use_custom_branding: formData.can_use_custom_branding,
        price_monthly: Number(formData.price_monthly),
        price_yearly: Number(formData.price_yearly),
      },
    });

    setEditingPlan(null);
  };

  const formatLimit = (value: number) => value === -1 ? "∞" : value.toLocaleString();
  const formatLimitFull = (value: number) => value === -1 ? "Unlimited" : value.toLocaleString();

  const tierConfig = {
    trial: { 
      color: "from-slate-500 to-slate-600",
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      icon: "text-slate-500"
    },
    basic: { 
      color: "from-blue-500 to-blue-600",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      icon: "text-blue-500"
    },
    pro: { 
      color: "from-purple-500 to-purple-600",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
      icon: "text-purple-500"
    },
    premium: { 
      color: "from-amber-500 to-orange-500",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      icon: "text-amber-500"
    },
    enterprise: { 
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      icon: "text-emerald-500"
    },
  };

  const featureIcons = {
    can_use_public_profile: Globe,
    can_use_queue_booking: Users,
    can_use_whatsapp_notifications: Bell,
    can_use_analytics: BarChart3,
    can_export_data: Download,
    can_use_custom_branding: Palette,
  };

  const featureLabels = {
    can_use_public_profile: "Public Profile",
    can_use_queue_booking: "Queue Booking",
    can_use_whatsapp_notifications: "WhatsApp",
    can_use_analytics: "Analytics",
    can_export_data: "Export",
    can_use_custom_branding: "Branding",
  };

  return (
    <AdminLayout
      title="Plan Configuration"
      description="Configure subscription tier features and limits"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const config = tierConfig[plan.tier] || tierConfig.basic;
            return (
              <Card key={plan.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${config.color} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="opacity-90 hover:opacity-100"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm opacity-90 mt-1">{plan.description}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">৳{plan.price_monthly.toLocaleString()}</span>
                    <span className="opacity-75">/mo</span>
                    <span className="text-xs opacity-60 ml-2">
                      or ৳{plan.price_yearly.toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Limits Grid */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Limits
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      <LimitBadge 
                        icon={Users} 
                        value={plan.max_patients} 
                        label="Patients" 
                      />
                      <LimitBadge 
                        icon={FileText} 
                        value={plan.max_prescriptions_per_month} 
                        label="Rx/mo" 
                      />
                      <LimitBadge 
                        icon={MessageSquare} 
                        value={plan.sms_credits} 
                        label="SMS" 
                      />
                      <LimitBadge 
                        icon={UserPlus} 
                        value={plan.max_staff} 
                        label="Staff" 
                      />
                      <LimitBadge 
                        icon={Building2} 
                        value={plan.max_chambers} 
                        label="Chambers" 
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Features
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(featureLabels).map(([key, label]) => {
                        const Icon = featureIcons[key as keyof typeof featureIcons];
                        const enabled = plan[key as keyof SubscriptionPlan] as boolean;
                        return (
                          <div 
                            key={key}
                            className={`flex items-center gap-1.5 text-xs p-1.5 rounded ${
                              enabled 
                                ? 'text-foreground bg-primary/5' 
                                : 'text-muted-foreground/50 line-through'
                            }`}
                          >
                            {enabled ? (
                              <Check className="w-3 h-3 text-primary flex-shrink-0" />
                            ) : (
                              <X className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Edit {editingPlan?.name} Plan
            </DialogTitle>
            <DialogDescription>
              Configure limits, features, and pricing for this subscription tier.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="limits" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="limits" className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Set -1 for unlimited. These limits control what doctors on this plan can use.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <LimitInput
                  label="Max Patients"
                  icon={Users}
                  value={formData.max_patients}
                  onChange={(val) => setFormData({ ...formData, max_patients: val })}
                />
                <LimitInput
                  label="Prescriptions/Month"
                  icon={FileText}
                  value={formData.max_prescriptions_per_month}
                  onChange={(val) => setFormData({ ...formData, max_prescriptions_per_month: val })}
                />
                <LimitInput
                  label="SMS Credits/Month"
                  icon={MessageSquare}
                  value={formData.sms_credits}
                  onChange={(val) => setFormData({ ...formData, sms_credits: val })}
                />
                <LimitInput
                  label="Staff Members"
                  icon={UserPlus}
                  value={formData.max_staff}
                  onChange={(val) => setFormData({ ...formData, max_staff: val })}
                />
                <LimitInput
                  label="Chambers"
                  icon={Building2}
                  value={formData.max_chambers}
                  onChange={(val) => setFormData({ ...formData, max_chambers: val })}
                />
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 py-4">
              <div className="space-y-3">
                <FeatureSwitch
                  label="Public Profile"
                  description="Allow doctor to have a public profile page"
                  icon={Globe}
                  checked={formData.can_use_public_profile}
                  onChange={(checked) => setFormData({ ...formData, can_use_public_profile: checked })}
                />
                <FeatureSwitch
                  label="Queue Booking"
                  description="Enable public queue booking widget"
                  icon={Users}
                  checked={formData.can_use_queue_booking}
                  onChange={(checked) => setFormData({ ...formData, can_use_queue_booking: checked })}
                />
                <FeatureSwitch
                  label="WhatsApp Notifications"
                  description="Send automated WhatsApp messages"
                  icon={Bell}
                  checked={formData.can_use_whatsapp_notifications}
                  onChange={(checked) => setFormData({ ...formData, can_use_whatsapp_notifications: checked })}
                />
                <FeatureSwitch
                  label="Analytics"
                  description="Access to analytics dashboard"
                  icon={BarChart3}
                  checked={formData.can_use_analytics}
                  onChange={(checked) => setFormData({ ...formData, can_use_analytics: checked })}
                />
                <FeatureSwitch
                  label="Data Export"
                  description="Export patient and financial data"
                  icon={Download}
                  checked={formData.can_export_data}
                  onChange={(checked) => setFormData({ ...formData, can_export_data: checked })}
                />
                <FeatureSwitch
                  label="Custom Branding"
                  description="Custom prescription headers and branding"
                  icon={Palette}
                  checked={formData.can_use_custom_branding}
                  onChange={(checked) => setFormData({ ...formData, can_use_custom_branding: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Plan name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description of this plan"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Monthly Price (BDT)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input
                        type="number"
                        value={formData.price_monthly}
                        onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Yearly Price (BDT)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input
                        type="number"
                        value={formData.price_yearly}
                        onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                        className="pl-7"
                      />
                    </div>
                    {formData.price_yearly && formData.price_monthly ? (
                      <p className="text-xs text-muted-foreground">
                        {Math.round((1 - (formData.price_yearly / (formData.price_monthly * 12))) * 100)}% savings vs monthly
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updatePlan.isPending}>
              {updatePlan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Sub-components for cleaner code
function LimitBadge({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  const isUnlimited = value === -1;
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${isUnlimited ? 'text-primary' : 'text-foreground'}`}>
        {isUnlimited ? <Infinity className="w-5 h-5 mx-auto" /> : value.toLocaleString()}
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function LimitInput({ 
  label, 
  icon: Icon, 
  value, 
  onChange 
}: { 
  label: string; 
  icon: React.ElementType; 
  value?: number; 
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant={value === -1 ? "default" : "outline"} 
          size="sm"
          onClick={() => onChange(-1)}
          className="shrink-0"
        >
          <Infinity className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function FeatureSwitch({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}