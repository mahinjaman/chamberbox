import { Card, CardContent } from "@/components/ui/card";
import { IntegrationSettings } from "@/hooks/useIntegrationSettings";
import { MessageCircle } from "lucide-react";

interface WhatsAppSettingsProps {
  settings: IntegrationSettings | null | undefined;
}

export const WhatsAppSettings = ({ settings }: WhatsAppSettingsProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">
          WhatsApp Business API integration is under development. Stay tuned for automated patient notifications via WhatsApp!
        </p>
      </CardContent>
    </Card>
  );
};
