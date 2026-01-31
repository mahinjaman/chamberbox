import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, MapPin, Clock, Navigation, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueStatusTranslations } from './types';

interface DoctorInfoCardProps {
  doctorName: string;
  chamberName: string;
  chamberAddress: string;
  scheduleStart: string;
  scheduleEnd: string;
  patientSerial: number;
  expectedCallTime: Date;
  t: QueueStatusTranslations;
}

export const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  doctorName,
  chamberName,
  chamberAddress,
  scheduleStart,
  scheduleEnd,
  patientSerial,
  expectedCallTime,
  t,
}) => {
  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(chamberAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const callTime = expectedCallTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const message = `I'm #${patientSerial} in queue at ${chamberName}. Expected time: ${callTime}. 🏥`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl p-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <Stethoscope className="h-4 w-4" />
          {t.doctorInfo}
        </div>

        {/* Doctor Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{doctorName}</h3>
          <p className="text-base font-medium text-primary">{chamberName}</p>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{chamberAddress}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.todaySchedule}:</span>
            <span className="font-semibold text-foreground">
              {scheduleStart} - {scheduleEnd}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleGetDirections}
            className="h-11 border-primary/30 hover:bg-primary/5"
          >
            <Navigation className="mr-2 h-4 w-4" />
            {t.directions}
          </Button>
          <Button
            variant="outline"
            onClick={handleShareWhatsApp}
            className="h-11 border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t.shareWhatsApp}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
