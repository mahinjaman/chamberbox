import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueStatusTranslations } from './types';

interface ErrorStateProps {
  errorType: 'invalid' | 'already_seen' | 'network';
  onRetry?: () => void;
  t: QueueStatusTranslations;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ errorType, onRetry, t }) => {
  const errorConfig = {
    invalid: {
      icon: AlertCircle,
      message: t.invalidSerial,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    already_seen: {
      icon: CheckCircle,
      message: t.alreadySeen,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    network: {
      icon: WifiOff,
      message: t.networkError,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
  };

  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl ${config.bgColor} border ${config.borderColor} p-6 text-center`}
    >
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>

        <p className={`text-base font-medium ${config.color}`}>{config.message}</p>

        {errorType === 'network' && onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t.retry}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
