import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from './AnimatedCounter';
import { QueueStatusTranslations } from './types';

interface WaitTimeCardProps {
  estimatedWaitMinutes: number;
  expectedCallTime: Date;
  patientsAhead: number;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  t: QueueStatusTranslations;
}

export const WaitTimeCard: React.FC<WaitTimeCardProps> = ({
  estimatedWaitMinutes,
  expectedCallTime,
  patientsAhead,
  notificationsEnabled,
  onToggleNotifications,
  t,
}) => {
  const hours = Math.floor(estimatedWaitMinutes / 60);
  const minutes = estimatedWaitMinutes % 60;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const showTurnSoon = patientsAhead <= 5 && patientsAhead > 0;
  const showNoRush = estimatedWaitMinutes > 30;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl p-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative space-y-5">
        {/* Estimated Wait */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t.estimatedWait}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{t.approximately}</span>
            {hours > 0 && (
              <>
                <AnimatedCounter
                  value={hours}
                  className="text-3xl font-black text-violet-500"
                />
                <span className="text-lg font-medium text-muted-foreground">{t.hours}</span>
              </>
            )}
            <AnimatedCounter
              value={minutes}
              className="text-3xl font-black text-violet-500"
            />
            <span className="text-lg font-medium text-muted-foreground">{t.minutes}</span>
          </div>
        </div>

        {/* Expected Call Time */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <div className="text-center">
            <p className="text-xs text-sky-600 dark:text-sky-400">{t.expectedCallTime}</p>
            <p className="text-lg font-bold text-sky-700 dark:text-sky-300">
              {formatTime(expectedCallTime)}
            </p>
          </div>
        </div>

        {/* Anxiety-reducing messages */}
        {showTurnSoon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 text-center">
              🎉 {t.yourTurnSoon}
            </p>
          </motion.div>
        )}

        {showNoRush && !showTurnSoon && (
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">☕ {t.noRush}</p>
          </div>
        )}

        {/* System-generated disclaimer */}
        <p className="text-[10px] text-center text-muted-foreground/70 italic">
          ⚠️ This is a system-generated estimated call time. Please follow the doctor's schedule and arrive at the chamber accordingly.
        </p>

        {/* Notification Toggle */}
        <Button
          variant={notificationsEnabled ? 'default' : 'outline'}
          onClick={onToggleNotifications}
          className={`w-full ${
            notificationsEnabled
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
              : ''
          }`}
        >
          {notificationsEnabled ? (
            <BellRing className="mr-2 h-4 w-4" />
          ) : (
            <Bell className="mr-2 h-4 w-4" />
          )}
          {t.enableNotifications}
        </Button>
      </div>
    </motion.div>
  );
};
