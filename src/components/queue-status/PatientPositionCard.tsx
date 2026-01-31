import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from './AnimatedCounter';
import { QueueStatusTranslations } from './types';

interface PatientPositionCardProps {
  patientSerial: number;
  currentSerial: number;
  patientsAhead: number;
  t: QueueStatusTranslations;
}

export const PatientPositionCard: React.FC<PatientPositionCardProps> = ({
  patientSerial,
  currentSerial,
  patientsAhead,
  t,
}) => {
  // Calculate progress (how far along the queue has progressed)
  const totalInQueue = patientSerial;
  const progress = totalInQueue > 0 ? ((currentSerial / totalInQueue) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl p-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      <div className="relative space-y-5">
        {/* Your Serial */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t.yourSerial}
          </p>
          <div className="flex items-center justify-center">
            <span className="text-xl font-bold text-muted-foreground">#</span>
            <span className="text-5xl font-black text-sky-500">{patientSerial}</span>
          </div>
        </div>

        {/* Patients Ahead */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="text-base font-semibold text-amber-700 dark:text-amber-300">
            <AnimatedCounter value={patientsAhead} className="font-black" /> {t.patientsAhead}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>#{currentSerial}</span>
            <span>#{patientSerial}</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden bg-secondary">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
