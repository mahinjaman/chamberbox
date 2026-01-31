import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Clock, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IntegrationSettings } from "@/hooks/useIntegrationSettings";

interface CalendlyWidgetProps {
  settings: Partial<IntegrationSettings> | null;
  doctorName: string;
  fee?: number;
  onFallbackToBuiltIn?: () => void;
}

export const CalendlyWidget = ({ settings, doctorName, fee, onFallbackToBuiltIn }: CalendlyWidgetProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Handle redirect with countdown
  const handleRedirect = () => {
    if (!settings?.calendly_url) return;
    
    setRedirectCountdown(3);
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          window.open(settings.calendly_url!, '_blank');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleButtonClick = () => {
    if (!settings?.calendly_enabled || !settings?.calendly_url) {
      onFallbackToBuiltIn?.();
      return;
    }

    switch (settings.calendly_display_mode) {
      case 'button':
        handleRedirect();
        break;
      case 'popup':
        setShowPopup(true);
        break;
      case 'inline':
        // Inline is shown directly, button scrolls to it
        document.getElementById('calendly-inline')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  };

  if (!settings?.calendly_enabled || !settings?.calendly_url) {
    return null;
  }

  return (
    <>
      {/* Main CTA Button */}
      <div className="space-y-3">
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={handleButtonClick}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Book via Calendly
          {settings.calendly_display_mode === 'button' && (
            <ExternalLink className="w-4 h-4 ml-2" />
          )}
        </Button>
        
        {redirectCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            Redirecting to secure booking partner in {redirectCountdown}...
          </motion.div>
        )}
      </div>

      {/* Inline Widget */}
      {settings.calendly_display_mode === 'inline' && (
        <Card id="calendly-inline" className="mt-4 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Select a Time</span>
                </div>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  30 min
                </Badge>
              </div>
            </div>
            <div className="relative bg-background" style={{ minHeight: '600px' }}>
              <iframe
                src={settings.calendly_url}
                width="100%"
                height="600"
                frameBorder="0"
                title="Schedule Appointment"
                className="border-0"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popup Modal */}
      <AnimatePresence>
        {showPopup && settings.calendly_display_mode === 'popup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl overflow-hidden w-full max-w-2xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Book Appointment with {doctorName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPopup(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative" style={{ height: '600px' }}>
                <iframe
                  src={settings.calendly_url}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Schedule Appointment"
                  className="border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Preview Card */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next Available</p>
              <p className="font-medium">Tomorrow, 6:00 PM</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Consultation Fee</p>
              <p className="font-bold text-primary">
                ৳{fee?.toLocaleString() || '500-1000'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
