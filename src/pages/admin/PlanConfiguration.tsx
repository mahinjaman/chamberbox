import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSubscriptionAdmin, SubscriptionPlan } from "@/hooks/useSubscription";
import { Loader2, Edit, Save, Crown, Users, FileText, MessageSquare, Building2, UserPlus } from "lucide-react";
import { toast } from "sonner";

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

  const formatLimit = (value: number) => value === -1 ? "Unlimited" : value.toLocaleString();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "trial": return "bg-gray-100 text-gray-800";
      case "basic": return "bg-blue-100 text-blue-800";
      case "pro": return "bg-purple-100 text-purple-800";
      case "premium": return "bg-amber-100 text-amber-800";
      case "enterprise": return "bg-green-100 text-green-800";
      default: return "";
    }
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
        <div className="grid gap-6">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className={`w-6 h-6 ${plan.tier === 'enterprise' ? 'text-green-600' : plan.tier === 'premium' ? 'text-amber-600' : 'text-primary'}`} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        <Badge className={`${getTierColor(plan.tier)} capitalize`}>
                          {plan.tier}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">৳{plan.price_monthly.toLocaleString()}/mo</p>
                      <p className="text-sm text-muted-foreground">৳{plan.price_yearly.toLocaleString()}/yr</p>
                    </div>
                    <Button variant="outline" onClick={() => handleEditPlan(plan)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Limits */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" /> Patients
                        </span>
                        <Badge variant="outline">{formatLimit(plan.max_patients)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Prescriptions/mo
                        </span>
                        <Badge variant="outline">{formatLimit(plan.max_prescriptions_per_month)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> SMS Credits
                        </span>
                        <Badge variant="outline">{formatLimit(plan.sms_credits)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> Staff Members
                        </span>
                        <Badge variant="outline">{formatLimit(plan.max_staff)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> Chambers
                        </span>
                        <Badge variant="outline">{formatLimit(plan.max_chambers)}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 md:col-span-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={plan.can_use_public_profile ? "default" : "outline"} className={!plan.can_use_public_profile ? "opacity-50" : ""}>
                        Public Profile
                      </Badge>
                      <Badge variant={plan.can_use_queue_booking ? "default" : "outline"} className={!plan.can_use_queue_booking ? "opacity-50" : ""}>
                        Queue Booking
                      </Badge>
                      <Badge variant={plan.can_use_whatsapp_notifications ? "default" : "outline"} className={!plan.can_use_whatsapp_notifications ? "opacity-50" : ""}>
                        WhatsApp Notifications
                      </Badge>
                      <Badge variant={plan.can_use_analytics ? "default" : "outline"} className={!plan.can_use_analytics ? "opacity-50" : ""}>
                        Analytics
                      </Badge>
                      <Badge variant={plan.can_export_data ? "default" : "outline"} className={!plan.can_export_data ? "opacity-50" : ""}>
                        Data Export
                      </Badge>
                      <Badge variant={plan.can_use_custom_branding ? "default" : "outline"} className={!plan.can_use_custom_branding ? "opacity-50" : ""}>
                        Custom Branding
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingPlan?.name} Plan</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="limits" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="limits" className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Patients (-1 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_patients}
                    onChange={(e) => setFormData({ ...formData, max_patients: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Prescriptions/Month (-1 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_prescriptions_per_month}
                    onChange={(e) => setFormData({ ...formData, max_prescriptions_per_month: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMS Credits/Month (-1 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.sms_credits}
                    onChange={(e) => setFormData({ ...formData, sms_credits: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Staff Members (-1 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_staff}
                    onChange={(e) => setFormData({ ...formData, max_staff: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Chambers (-1 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_chambers}
                    onChange={(e) => setFormData({ ...formData, max_chambers: Number(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow doctor to have a public profile page</p>
                  </div>
                  <Switch
                    checked={formData.can_use_public_profile}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_use_public_profile: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Queue Booking</Label>
                    <p className="text-sm text-muted-foreground">Enable public queue booking widget</p>
                  </div>
                  <Switch
                    checked={formData.can_use_queue_booking}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_use_queue_booking: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send automated WhatsApp messages</p>
                  </div>
                  <Switch
                    checked={formData.can_use_whatsapp_notifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_use_whatsapp_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Access to analytics dashboard</p>
                  </div>
                  <Switch
                    checked={formData.can_use_analytics}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_use_analytics: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Export</Label>
                    <p className="text-sm text-muted-foreground">Export patient and financial data</p>
                  </div>
                  <Switch
                    checked={formData.can_export_data}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_export_data: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Custom Branding</Label>
                    <p className="text-sm text-muted-foreground">Custom prescription headers and branding</p>
                  </div>
                  <Switch
                    checked={formData.can_use_custom_branding}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_use_custom_branding: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Monthly Price (BDT)</Label>
                  <Input
                    type="number"
                    value={formData.price_monthly}
                    onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price (BDT)</Label>
                  <Input
                    type="number"
                    value={formData.price_yearly}
                    onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                  />
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
