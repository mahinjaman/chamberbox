import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, CheckCircle, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueStatusTranslations } from './types';

interface ErrorStateProps {
  errorType: 'invalid' | 'already_seen' | 'network' | 'notFound';
  onRetry?: () => void;
  t: QueueStatusTranslations;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ errorType, onRetry, t }) => {
  const errorConfig = {
    invalid: {
      icon: AlertCircle,
      message: t.invalidSerial,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
    },
    already_seen: {
      icon: CheckCircle,
      message: t.alreadySeen,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
    },
    network: {
      icon: WifiOff,
      message: t.networkError,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
    },
    notFound: {
      icon: Search,
      message: t.notFound,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
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

        {errorType === 'notFound' && (
          <p className="text-sm text-muted-foreground">
            {t.phoneNumber === 'মোবাইল নম্বর' 
              ? 'সঠিক মোবাইল নম্বর দিয়ে আবার চেষ্টা করুন' 
              : 'Please check your phone number and try again'
            }
          </p>
        )}

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
