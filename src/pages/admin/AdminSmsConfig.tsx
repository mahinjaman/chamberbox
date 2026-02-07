import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Plus, Edit, Trash2, Loader2, CheckCircle2, Eye, EyeOff, Star } from "lucide-react";

interface SmsProvider {
  id: string;
  gateway_name: string;
  display_name: string;
  api_url: string;
  api_key: string | null;
  sender_id: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

const LOCAL_PROVIDERS = [
  { value: "bulksmsbd", label: "BulkSMS BD", defaultUrl: "https://bulksmsbd.net/api/smsapi" },
  { value: "smsq", label: "SMSQ", defaultUrl: "https://api.smsq.global/api/v2/SendSMS" },
  { value: "greenweb", label: "Green Web BD", defaultUrl: "http://api.greenweb.com.bd/api.php" },
  { value: "bdbulksms", label: "BD Bulk SMS", defaultUrl: "https://bdbulksms.net/api.php" },
  { value: "elitbuzz", label: "Elitbuzz", defaultUrl: "https://msg.elitbuzz-bd.com/smsapi" },
  { value: "muthofun", label: "MuthoFun", defaultUrl: "https://api.muthofun.com/api/sendsms" },
  { value: "mimsms", label: "MIM SMS", defaultUrl: "https://esms.mimsms.com/smsapi" },
  { value: "adnsms", label: "ADN SMS", defaultUrl: "https://portal.adnsms.com/api/v1/secure/send-sms" },
  { value: "custom", label: "Custom Provider", defaultUrl: "" },
];

export default function AdminSmsConfig() {
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SmsProvider | null>(null);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [formGateway, setFormGateway] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formApiUrl, setFormApiUrl] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formSenderId, setFormSenderId] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsDefault, setFormIsDefault] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_sms_config")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to load SMS providers");
    } else {
      setProviders((data || []) as SmsProvider[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const resetForm = () => {
    setFormGateway("");
    setFormDisplayName("");
    setFormApiUrl("");
    setFormApiKey("");
    setFormSenderId("");
    setFormIsActive(true);
    setFormIsDefault(false);
    setShowApiKey(false);
    setEditingProvider(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (provider: SmsProvider) => {
    setEditingProvider(provider);
    setFormGateway(provider.gateway_name);
    setFormDisplayName(provider.display_name);
    setFormApiUrl(provider.api_url);
    setFormApiKey(provider.api_key || "");
    setFormSenderId(provider.sender_id || "");
    setFormIsActive(provider.is_active);
    setFormIsDefault(provider.is_default);
    setIsDialogOpen(true);
  };

  const handleGatewayChange = (value: string) => {
    setFormGateway(value);
    const preset = LOCAL_PROVIDERS.find(p => p.value === value);
    if (preset) {
      setFormDisplayName(preset.label);
      setFormApiUrl(preset.defaultUrl);
    }
  };

  const handleSave = async () => {
    if (!formGateway || !formDisplayName || !formApiUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      // If setting as default, unset other defaults first
      if (formIsDefault) {
        await supabase
          .from("platform_sms_config")
          .update({ is_default: false } as any)
          .neq("id", editingProvider?.id || "");
      }

      const payload = {
        gateway_name: formGateway,
        display_name: formDisplayName,
        api_url: formApiUrl,
        api_key: formApiKey || null,
        sender_id: formSenderId || null,
        is_active: formIsActive,
        is_default: formIsDefault,
      };

      if (editingProvider) {
        const { error } = await supabase
          .from("platform_sms_config")
          .update(payload as any)
          .eq("id", editingProvider.id);
        if (error) throw error;
        toast.success("Provider updated");
      } else {
        const { error } = await supabase
          .from("platform_sms_config")
          .insert(payload as any);
        if (error) throw error;
        toast.success("Provider added");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProviders();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this SMS provider?")) return;
    
    const { error } = await supabase
      .from("platform_sms_config")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Provider deleted");
      fetchProviders();
    }
  };

  const toggleDefault = async (provider: SmsProvider) => {
    // Unset all defaults first
    await supabase
      .from("platform_sms_config")
      .update({ is_default: false } as any)
      .neq("id", provider.id);

    // Set this one as default
    await supabase
      .from("platform_sms_config")
      .update({ is_default: true } as any)
      .eq("id", provider.id);

    toast.success(`${provider.display_name} set as default`);
    fetchProviders();
  };

  const toggleActive = async (provider: SmsProvider) => {
    await supabase
      .from("platform_sms_config")
      .update({ is_active: !provider.is_active } as any)
      .eq("id", provider.id);

    toast.success(provider.is_active ? "Provider disabled" : "Provider enabled");
    fetchProviders();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SMS Gateway Configuration</h1>
            <p className="text-muted-foreground">Configure platform-level SMS providers for patient notifications</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No SMS Providers Configured</h3>
              <p className="text-muted-foreground mb-4">Add a local SMS provider to enable patient notifications.</p>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Provider
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className={provider.is_default ? "border-primary/50" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.is_active ? "bg-primary/10" : "bg-muted"}`}>
                        <MessageSquare className={`w-5 h-5 ${provider.is_active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{provider.display_name}</h3>
                          {provider.is_default && (
                            <Badge className="bg-primary/20 text-primary border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                          <Badge variant={provider.is_active ? "default" : "secondary"}>
                            {provider.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gateway: {provider.gateway_name} • Sender ID: {provider.sender_id || "Not set"}
                        </p>
                        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                          {provider.api_url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!provider.is_default && provider.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDefault(provider)}
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={() => toggleActive(provider)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(provider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProvider ? "Edit SMS Provider" : "Add SMS Provider"}</DialogTitle>
              <DialogDescription>
                Configure a local SMS gateway for patient notifications.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SMS Provider *</Label>
                <Select value={formGateway} onValueChange={handleGatewayChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCAL_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="e.g., BulkSMS BD"
                />
              </div>

              <div className="space-y-2">
                <Label>API URL *</Label>
                <Input
                  value={formApiUrl}
                  onChange={(e) => setFormApiUrl(e.target.value)}
                  placeholder="https://api.provider.com/send"
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="Enter API key"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input
                  value={formSenderId}
                  onChange={(e) => setFormSenderId(e.target.value)}
                  placeholder="e.g., ChamberBox"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Set as Default Provider</Label>
                <Switch checked={formIsDefault} onCheckedChange={setFormIsDefault} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProvider ? "Update" : "Add Provider"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
