import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';
import { QueueStatusTranslations } from './types';

interface CurrentSerialCardProps {
  currentSerial: number;
  queueStatus: 'running' | 'break' | 'closed' | 'waiting';
  t: QueueStatusTranslations;
}

export const CurrentSerialCard: React.FC<CurrentSerialCardProps> = ({
  currentSerial,
  queueStatus,
  t,
}) => {
  const statusConfig = {
    running: {
      color: 'bg-emerald-500',
      ringColor: 'ring-emerald-500/30',
      text: t.queueRunning,
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    break: {
      color: 'bg-amber-500',
      ringColor: 'ring-amber-500/30',
      text: t.queueBreak,
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    closed: {
      color: 'bg-red-500',
      ringColor: 'ring-red-500/30',
      text: t.queueClosed,
      textColor: 'text-red-600 dark:text-red-400',
    },
    waiting: {
      color: 'bg-blue-500',
      ringColor: 'ring-blue-500/30',
      text: t.queueWaiting,
      textColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const config = statusConfig[queueStatus];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl p-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 pointer-events-none" />

      <div className="relative text-center space-y-4">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${config.color} ring-4 ${config.ringColor}`}
            animate={{
              scale: queueStatus === 'running' ? [1, 1.2, 1] : 1,
              opacity: queueStatus === 'running' ? [1, 0.7, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
        </div>

        {/* Current Serial Label */}
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t.currentRunning}
        </p>

        {/* Large Serial Number */}
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground">#</span>
          <AnimatedCounter
            value={currentSerial}
            className="text-7xl font-black bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};
