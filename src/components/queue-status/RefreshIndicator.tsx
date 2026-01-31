import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueStatusTranslations } from './types';

interface RefreshIndicatorProps {
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
  t: QueueStatusTranslations;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing,
  t,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>(t.justNow);

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

      if (diffSeconds < 5) {
        setTimeAgo(t.justNow);
      } else if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds} ${t.secondsAgo}`);
      } else {
        const diffMinutes = Math.floor(diffSeconds / 60);
        setTimeAgo(`${diffMinutes}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 border border-border/50"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t.lastUpdated}:</span>
        <span className="font-medium text-foreground">{timeAgo}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-8 px-3"
      >
        <RefreshCw
          className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        {t.refresh}
      </Button>
    </motion.div>
  );
};
