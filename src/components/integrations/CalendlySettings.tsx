import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationSettings, useIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { Calendar, ExternalLink, Check, X, Loader2, RefreshCw, Info } from "lucide-react";
import { motion } from "framer-motion";

interface CalendlySettingsProps {
  settings: IntegrationSettings | null | undefined;
}

export const CalendlySettings = ({ settings }: CalendlySettingsProps) => {
  const { updateSettings, verifyCalendlyUrl } = useIntegrationSettings();
  
  const [calendlyUrl, setCalendlyUrl] = useState(settings?.calendly_url || "");
  const [displayMode, setDisplayMode] = useState<'inline' | 'button' | 'popup'>(settings?.calendly_display_mode || 'button');
  const [eventType, setEventType] = useState(settings?.calendly_event_type || "");
  const [bufferMinutes, setBufferMinutes] = useState(settings?.calendly_buffer_minutes || 15);
  const [enabled, setEnabled] = useState(settings?.calendly_enabled || false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(settings?.calendly_verified || false);

  useEffect(() => {
    if (settings) {
      setCalendlyUrl(settings.calendly_url || "");
      setDisplayMode(settings.calendly_display_mode || 'button');
      setEventType(settings.calendly_event_type || "");
      setBufferMinutes(settings.calendly_buffer_minutes || 15);
      setEnabled(settings.calendly_enabled || false);
      setVerified(settings.calendly_verified || false);
    }
  }, [settings]);

  const handleVerify = async () => {
    setVerifying(true);
    const isValid = await verifyCalendlyUrl(calendlyUrl);
    setVerified(isValid);
    setVerifying(false);
    
    if (isValid) {
      await updateSettings.mutateAsync({
        calendly_url: calendlyUrl,
        calendly_verified: true,
      });
    }
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      calendly_enabled: enabled,
      calendly_url: calendlyUrl,
      calendly_display_mode: displayMode,
      calendly_event_type: eventType,
      calendly_buffer_minutes: bufferMinutes,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Calendly Integration</CardTitle>
                <CardDescription>
                  Connect your Calendly account for seamless appointment booking
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
            {/* Calendly URL */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendly-url">Calendly Profile URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="calendly-url"
                      value={calendlyUrl}
                      onChange={(e) => {
                        setCalendlyUrl(e.target.value);
                        setVerified(false);
                      }}
                      placeholder="https://calendly.com/your-username"
                      className={verified ? "pr-10 border-green-500" : ""}
                    />
                    {verified && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleVerify}
                    disabled={!calendlyUrl || verifying}
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : verified ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Verified
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your Calendly profile URL (e.g., https://calendly.com/dr-rahman)
                </p>
              </div>

              {/* Display Mode */}
              <div className="space-y-3">
                <Label>Display Mode</Label>
                <RadioGroup
                  value={displayMode}
                  onValueChange={(v) => setDisplayMode(v as 'inline' | 'button' | 'popup')}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="mode-inline"
                    className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      displayMode === 'inline' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <RadioGroupItem value="inline" id="mode-inline" className="sr-only" />
                    <div className="w-12 h-12 rounded-lg bg-muted mb-2 flex items-center justify-center">
                      <div className="w-8 h-6 border-2 border-primary rounded" />
                    </div>
                    <span className="font-medium">Inline Embed</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Show calendar directly on page
                    </span>
                  </Label>
                  
                  <Label
                    htmlFor="mode-button"
                    className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      displayMode === 'button' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <RadioGroupItem value="button" id="mode-button" className="sr-only" />
                    <div className="w-12 h-12 rounded-lg bg-muted mb-2 flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">Button Redirect</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Opens Calendly in new tab
                    </span>
                  </Label>
                  
                  <Label
                    htmlFor="mode-popup"
                    className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      displayMode === 'popup' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <RadioGroupItem value="popup" id="mode-popup" className="sr-only" />
                    <div className="w-12 h-12 rounded-lg bg-muted mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary rounded shadow-lg" />
                    </div>
                    <span className="font-medium">Popup Modal</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Opens in overlay modal
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label>Event Type (Optional)</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                    <SelectItem value="emergency">Emergency Consultation</SelectItem>
                    <SelectItem value="online">Online Consultation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the default event type for appointments
                </p>
              </div>

              {/* Buffer Time */}
              <div className="space-y-2">
                <Label>Buffer Time Between Appointments</Label>
                <Select 
                  value={bufferMinutes.toString()} 
                  onValueChange={(v) => setBufferMinutes(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {verified && calendlyUrl && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Preview</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Patients will see a{" "}
                    <Badge variant="outline">
                      {displayMode === 'inline' 
                        ? 'calendar widget' 
                        : displayMode === 'button' 
                          ? '"Book Now" button' 
                          : 'popup booking modal'}
                    </Badge>{" "}
                    on your public profile.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Calendar
            </Button>
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
