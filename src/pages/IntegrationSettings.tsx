import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { CalendlySettings } from "@/components/integrations/CalendlySettings";
import { WhatsAppSettings } from "@/components/integrations/WhatsAppSettings";
import { NotificationSettings } from "@/components/integrations/NotificationSettings";
import { Loader2, Calendar, MessageCircle, Bell } from "lucide-react";

const IntegrationSettings = () => {
  const { settings, isLoading } = useIntegrationSettings();
  const [activeTab, setActiveTab] = useState("calendly");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Integration Settings"
      description="Connect external services for appointment booking and patient notifications"
    >
      <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="calendly" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendly</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendly">
            <CalendlySettings settings={settings} />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppSettings settings={settings} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default IntegrationSettings;
