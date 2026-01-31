import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Current Serial Skeleton */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6">
        <div className="space-y-4 text-center">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-16 w-32 mx-auto rounded-xl" />
        </div>
      </div>

      {/* Position Skeleton */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6">
        <div className="space-y-4 text-center">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-12 w-24 mx-auto" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      {/* Wait Time Skeleton */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6">
        <div className="space-y-4 text-center">
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-8 w-40 mx-auto" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Doctor Info Skeleton */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
