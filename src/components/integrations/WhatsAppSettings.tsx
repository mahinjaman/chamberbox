import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IntegrationSettings, useIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { MessageCircle, Send, Check, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppSettingsProps {
  settings: IntegrationSettings | null | undefined;
}

export const WhatsAppSettings = ({ settings }: WhatsAppSettingsProps) => {
  const { updateSettings, sendTestWhatsApp } = useIntegrationSettings();
  
  const [enabled, setEnabled] = useState(settings?.whatsapp_enabled || false);
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsapp_number || "");
  const [apiProvider, setApiProvider] = useState(settings?.whatsapp_api_provider || "manual");
  const [apiKey, setApiKey] = useState(settings?.whatsapp_api_key || "");
  const [templateId, setTemplateId] = useState(settings?.whatsapp_template_id || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.whatsapp_enabled || false);
      setWhatsappNumber(settings.whatsapp_number || "");
      setApiProvider(settings.whatsapp_api_provider || "manual");
      setApiKey(settings.whatsapp_api_key || "");
      setTemplateId(settings.whatsapp_template_id || "");
    }
  }, [settings]);

  const handleSendTest = async () => {
    setSendingTest(true);
    const testMessage = "এটি ChamberBox থেকে একটি টেস্ট মেসেজ। আপনার WhatsApp ইন্টিগ্রেশন সফল!";
    await sendTestWhatsApp(testNumber, testMessage);
    setSendingTest(false);
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      whatsapp_enabled: enabled,
      whatsapp_number: whatsappNumber,
      whatsapp_api_provider: apiProvider as any,
      whatsapp_api_key: apiKey,
      whatsapp_template_id: templateId,
    });
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Format as 880XXXXXXXXXX
    if (digits.startsWith("880")) {
      return digits.slice(0, 13);
    } else if (digits.startsWith("0")) {
      return "88" + digits.slice(0, 11);
    }
    return digits.slice(0, 13);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle>WhatsApp Business API</CardTitle>
                <CardDescription>
                  Send automated appointment notifications via WhatsApp
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: enabled ? 1 : 0.5 }}
            animate={{ opacity: enabled ? 1 : 0.5 }}
            className={!enabled ? "pointer-events-none" : ""}
          >
            {/* WhatsApp Number */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">WhatsApp Business Number</Label>
                <Input
                  id="whatsapp-number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(formatWhatsAppNumber(e.target.value))}
                  placeholder="8801XXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your WhatsApp Business number with country code (Bangladesh: 880)
                </p>
              </div>

              {/* API Provider */}
              <div className="space-y-2">
                <Label>API Provider</Label>
                <Select value={apiProvider} onValueChange={(v) => setApiProvider(v as 'twilio' | 'ultramsg' | '360dialog' | 'manual')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <span>Manual (WhatsApp Link)</span>
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="twilio">
                      <div className="flex items-center gap-2">
                        <span>Twilio</span>
                        <Badge variant="outline" className="text-xs">Enterprise</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="ultramsg">
                      <div className="flex items-center gap-2">
                        <span>UltraMsg</span>
                        <Badge variant="outline" className="text-xs">Popular</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="360dialog">
                      <div className="flex items-center gap-2">
                        <span>360dialog</span>
                        <Badge variant="outline" className="text-xs">Official</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* API Key (only for automated providers) */}
              {apiProvider !== 'manual' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key / Token</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-id">Template Message ID</Label>
                    <Input
                      id="template-id"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      placeholder="Enter approved template ID"
                    />
                    <p className="text-xs text-muted-foreground">
                      WhatsApp requires pre-approved message templates for business messaging
                    </p>
                  </div>
                </>
              )}

              {/* Manual Mode Info */}
              {apiProvider === 'manual' && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Manual Mode
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      In manual mode, a WhatsApp link will be generated for each patient. 
                      You'll need to click to send messages manually. For automated messaging, 
                      select an API provider.
                    </p>
                  </div>
                </div>
              )}

              {/* Test Message Section */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Send Test Message</h4>
                <div className="flex gap-2">
                  <Input
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="01XXXXXXXXX"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSendTest}
                    disabled={testNumber.length !== 11 || sendingTest || apiProvider === 'manual'}
                  >
                    {sendingTest ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Test Message Preview */}
                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Message Preview
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-white dark:bg-card p-3 rounded-lg">
                    এটি ChamberBox থেকে একটি টেস্ট মেসেজ। আপনার WhatsApp ইন্টিগ্রেশন সফল!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
