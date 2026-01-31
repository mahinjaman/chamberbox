import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IntegrationSettings, useIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { Bell, MessageSquare, Clock, CheckCircle, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationSettingsProps {
  settings: IntegrationSettings | null | undefined;
}

const TEMPLATE_VARIABLES = [
  { key: "{{patient_name}}", label: "Patient Name" },
  { key: "{{doctor_name}}", label: "Doctor Name" },
  { key: "{{date}}", label: "Appointment Date" },
  { key: "{{time}}", label: "Appointment Time" },
  { key: "{{chamber_address}}", label: "Chamber Address" },
  { key: "{{serial_number}}", label: "Token Number" },
];

export const NotificationSettings = ({ settings }: NotificationSettingsProps) => {
  const { updateSettings } = useIntegrationSettings();
  
  const [sendConfirmation, setSendConfirmation] = useState(settings?.send_booking_confirmation ?? true);
  const [sendReminder, setSendReminder] = useState(settings?.send_reminder_before ?? true);
  const [reminderHours, setReminderHours] = useState(settings?.reminder_hours_before ?? 2);
  const [sendFollowup, setSendFollowup] = useState(settings?.send_followup_after ?? false);
  
  const [confirmationTemplate, setConfirmationTemplate] = useState(
    settings?.confirmation_template || 
    'প্রিয় {{patient_name}}, আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে। ডাক্তার: {{doctor_name}}, তারিখ: {{date}}, সময়: {{time}}, সিরিয়াল: {{serial_number}}। ঠিকানা: {{chamber_address}}'
  );
  const [reminderTemplate, setReminderTemplate] = useState(
    settings?.reminder_template || 
    'রিমাইন্ডার: আজ {{time}} বাজে {{doctor_name}} এর সাথে আপনার অ্যাপয়েন্টমেন্ট আছে। সিরিয়াল: {{serial_number}}'
  );
  const [followupTemplate, setFollowupTemplate] = useState(
    settings?.followup_template || 
    'প্রিয় {{patient_name}}, {{doctor_name}} এর চেম্বারে আপনার ভিজিট কেমন ছিল? আমাদের সেবা সম্পর্কে আপনার মতামত জানান।'
  );

  useEffect(() => {
    if (settings) {
      setSendConfirmation(settings.send_booking_confirmation ?? true);
      setSendReminder(settings.send_reminder_before ?? true);
      setReminderHours(settings.reminder_hours_before ?? 2);
      setSendFollowup(settings.send_followup_after ?? false);
      if (settings.confirmation_template) setConfirmationTemplate(settings.confirmation_template);
      if (settings.reminder_template) setReminderTemplate(settings.reminder_template);
      if (settings.followup_template) setFollowupTemplate(settings.followup_template);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      send_booking_confirmation: sendConfirmation,
      send_reminder_before: sendReminder,
      reminder_hours_before: reminderHours,
      send_followup_after: sendFollowup,
      confirmation_template: confirmationTemplate,
      reminder_template: reminderTemplate,
      followup_template: followupTemplate,
    });
  };

  const insertVariable = (variable: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(prev => prev + variable);
  };

  return (
    <div className="space-y-6">
      {/* Variable Reference */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Template Variables</CardTitle>
          </div>
          <CardDescription>
            Use these variables in your message templates. They will be replaced with actual values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map(v => (
              <Badge key={v.key} variant="secondary" className="font-mono text-xs">
                {v.key}
                <span className="ml-1 text-muted-foreground font-normal">({v.label})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Confirmation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-base">Booking Confirmation</CardTitle>
                <CardDescription>
                  Send a WhatsApp message when appointment is booked
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={sendConfirmation}
              onCheckedChange={setSendConfirmation}
            />
          </div>
        </CardHeader>
        <motion.div
          initial={{ opacity: sendConfirmation ? 1 : 0.5, height: sendConfirmation ? 'auto' : 0 }}
          animate={{ opacity: sendConfirmation ? 1 : 0.5, height: sendConfirmation ? 'auto' : 0 }}
        >
          <CardContent className={!sendConfirmation ? "pointer-events-none" : ""}>
            <div className="space-y-2">
              <Label>Message Template</Label>
              <Textarea
                value={confirmationTemplate}
                onChange={(e) => setConfirmationTemplate(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map(v => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => insertVariable(v.key, setConfirmationTemplate)}
                  >
                    + {v.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </motion.div>
      </Card>

      {/* Reminder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Appointment Reminder</CardTitle>
                <CardDescription>
                  Send reminder before the appointment
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={sendReminder}
              onCheckedChange={setSendReminder}
            />
          </div>
        </CardHeader>
        <motion.div
          initial={{ opacity: sendReminder ? 1 : 0.5, height: sendReminder ? 'auto' : 0 }}
          animate={{ opacity: sendReminder ? 1 : 0.5, height: sendReminder ? 'auto' : 0 }}
        >
          <CardContent className={!sendReminder ? "pointer-events-none" : ""}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Send Reminder</Label>
                <Select 
                  value={reminderHours.toString()} 
                  onValueChange={(v) => setReminderHours(Number(v))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour before</SelectItem>
                    <SelectItem value="2">2 hours before</SelectItem>
                    <SelectItem value="4">4 hours before</SelectItem>
                    <SelectItem value="24">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  value={reminderTemplate}
                  onChange={(e) => setReminderTemplate(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map(v => (
                    <Button
                      key={v.key}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => insertVariable(v.key, setReminderTemplate)}
                    >
                      + {v.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>
      </Card>

      {/* Follow-up */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">Follow-up Message</CardTitle>
                <CardDescription>
                  Send feedback request after appointment
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={sendFollowup}
              onCheckedChange={setSendFollowup}
            />
          </div>
        </CardHeader>
        <motion.div
          initial={{ opacity: sendFollowup ? 1 : 0.5, height: sendFollowup ? 'auto' : 0 }}
          animate={{ opacity: sendFollowup ? 1 : 0.5, height: sendFollowup ? 'auto' : 0 }}
        >
          <CardContent className={!sendFollowup ? "pointer-events-none" : ""}>
            <div className="space-y-2">
              <Label>Message Template</Label>
              <Textarea
                value={followupTemplate}
                onChange={(e) => setFollowupTemplate(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map(v => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => insertVariable(v.key, setFollowupTemplate)}
                  >
                    + {v.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </motion.div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
