import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Save } from "lucide-react";

const Settings = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    specialization: profile?.specialization || "",
    bmdc_number: profile?.bmdc_number || "",
    chamber_address: profile?.chamber_address || "",
  });

  // Update form when profile loads
  if (profile && !formData.full_name && profile.full_name) {
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone || "",
      specialization: profile.specialization || "",
      bmdc_number: profile.bmdc_number || "",
      chamber_address: profile.chamber_address || "",
    });
  }

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

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your profile and chamber settings"
    >
      <div className="max-w-2xl space-y-6">
        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground capitalize">
                    {profile?.subscription_tier || "Basic"} Plan
                  </p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.subscription_tier === "basic"
                    ? "100 patients/month, 20 SMS credits"
                    : profile?.subscription_tier === "pro"
                    ? "Unlimited patients, 200 SMS credits"
                    : "Unlimited patients, Unlimited SMS"}
                </p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
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
