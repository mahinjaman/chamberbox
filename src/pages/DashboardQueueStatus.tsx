import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueInputForm } from '@/components/queue-status/QueueInputForm';
import { CurrentSerialCard } from '@/components/queue-status/CurrentSerialCard';
import { PatientPositionCard } from '@/components/queue-status/PatientPositionCard';
import { WaitTimeCard } from '@/components/queue-status/WaitTimeCard';
import { DoctorInfoCard } from '@/components/queue-status/DoctorInfoCard';
import { ErrorState } from '@/components/queue-status/ErrorState';
import { LoadingSkeleton } from '@/components/queue-status/LoadingSkeleton';
import { RefreshIndicator } from '@/components/queue-status/RefreshIndicator';
import { useQueueStatus } from '@/components/queue-status/useQueueStatus';
import { translations } from '@/components/queue-status/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardQueueStatus() {
  const { language } = useLanguage();
  const queueLang = language === 'bn' ? 'bn' : 'en';
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const {
    isLoading,
    error,
    queueData,
    lastUpdated,
    checkStatus,
    checkBySerialNumber,
    checkByPhoneAndDate,
    refresh,
    setError,
  } = useQueueStatus();

  const t = translations[queueLang];

  const handleCheckStatus = async (phoneNumber: string, serialNumber?: number) => {
    setShowStatus(true);
    await checkStatus(phoneNumber, serialNumber);
  };

  const handleSerialSearch = async (serialNumber: string) => {
    setShowStatus(true);
    await checkBySerialNumber(serialNumber);
  };

  const handlePhoneDateSearch = async (phoneNumber: string, date: Date) => {
    setShowStatus(true);
    await checkByPhoneAndDate(phoneNumber, date);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') setNotificationsEnabled(true);
      } catch (err) {
        console.error('Notification permission error:', err);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (showStatus && queueData && !error) {
      const interval = setInterval(() => refresh(), 30000);
      return () => clearInterval(interval);
    }
  }, [showStatus, queueData, error, refresh]);

  return (
    <DashboardLayout
      title={language === 'bn' ? 'কিউ স্ট্যাটাস ট্র্যাকার' : 'Queue Status Tracker'}
      description={language === 'bn' ? 'রোগীর কিউ পজিশন চেক করুন' : 'Check patient queue position'}
      actions={
        <Button variant="outline" size="sm" asChild>
          <a href="/queue-status" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'পাবলিক পেজ' : 'Public Page'}
          </a>
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Input Form */}
        <QueueInputForm
          onSubmit={handleCheckStatus}
          onSerialSearch={handleSerialSearch}
          onPhoneDateSearch={handlePhoneDateSearch}
          isLoading={isLoading}
          t={t}
        />

        {/* Status Display */}
        <AnimatePresence mode="wait">
          {showStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {error && (
                <ErrorState
                  errorType={error as 'invalid' | 'already_seen' | 'network' | 'notFound'}
                  onRetry={() => { setError(null); refresh(); }}
                  t={t}
                />
              )}

              {isLoading && !error && <LoadingSkeleton />}

              {!isLoading && !error && queueData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <RefreshIndicator
                    lastUpdated={lastUpdated}
                    onRefresh={refresh}
                    isRefreshing={isLoading}
                    t={t}
                  />
                  <div className="space-y-4">
                    <CurrentSerialCard
                      currentSerial={queueData.currentSerial}
                      queueStatus={queueData.queueStatus}
                      t={t}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <PatientPositionCard
                        patientSerial={queueData.patientSerial}
                        serialNumber={queueData.serialNumber}
                        currentSerial={queueData.currentSerial}
                        patientsAhead={queueData.patientsAhead}
                        t={t}
                      />
                      <WaitTimeCard
                        estimatedWaitMinutes={queueData.estimatedWaitMinutes}
                        expectedCallTime={queueData.expectedCallTime}
                        patientsAhead={queueData.patientsAhead}
                        notificationsEnabled={notificationsEnabled}
                        onToggleNotifications={handleToggleNotifications}
                        t={t}
                      />
                      <DoctorInfoCard
                        doctorName={queueData.doctorName}
                        chamberName={queueData.chamberName}
                        chamberAddress={queueData.chamberAddress}
                        scheduleStart={queueData.scheduleStart}
                        scheduleEnd={queueData.scheduleEnd}
                        patientSerial={queueData.patientSerial}
                        expectedCallTime={queueData.expectedCallTime}
                        t={t}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
