import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const QueueStatus: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const { isLoading, error, queueData, lastUpdated, checkStatus, refresh, setError } =
    useQueueStatus();

  const t = translations[language];

  // Initialize dark mode from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('queue_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('queue_theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  // Handle status check - now uses phone number as primary identifier
  const handleCheckStatus = async (phoneNumber: string, serialNumber?: number) => {
    setShowStatus(true);
    await checkStatus(phoneNumber, serialNumber);
  };

  // Handle notification toggle
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      } catch (err) {
        console.error('Notification permission error:', err);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Send notification when close to turn
  useEffect(() => {
    if (notificationsEnabled && queueData && queueData.patientsAhead <= 3) {
      new Notification('Your Turn is Coming!', {
        body: `Only ${queueData.patientsAhead} patients ahead of you.`,
        icon: '/favicon.ico',
      });
    }
  }, [notificationsEnabled, queueData?.patientsAhead]);

  // Auto-refresh every 30 seconds when status is shown
  useEffect(() => {
    if (showStatus && queueData && !error) {
      const interval = setInterval(() => {
        refresh();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [showStatus, queueData, error, refresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-success/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ChamberBox</h1>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="h-9 w-9"
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Input Form */}
        <QueueInputForm onSubmit={handleCheckStatus} isLoading={isLoading} t={t} />

        {/* Status Display */}
        <AnimatePresence mode="wait">
          {showStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Error State */}
              {error && (
                <ErrorState
                  errorType={error as 'invalid' | 'already_seen' | 'network' | 'notFound'}
                  onRetry={() => {
                    setError(null);
                    refresh();
                  }}
                  t={t}
                />
              )}

              {/* Loading State */}
              {isLoading && !error && <LoadingSkeleton />}

              {/* Success State */}
              {!isLoading && !error && queueData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Refresh Indicator */}
                  <RefreshIndicator
                    lastUpdated={lastUpdated}
                    onRefresh={refresh}
                    isRefreshing={isLoading}
                    t={t}
                  />

                  {/* Bento Grid Layout */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Current Serial - Full Width */}
                    <CurrentSerialCard
                      currentSerial={queueData.currentSerial}
                      queueStatus={queueData.queueStatus}
                      t={t}
                    />

                    {/* Patient Position */}
                    <PatientPositionCard
                      patientSerial={queueData.patientSerial}
                      currentSerial={queueData.currentSerial}
                      patientsAhead={queueData.patientsAhead}
                      t={t}
                    />

                    {/* Wait Time */}
                    <WaitTimeCard
                      estimatedWaitMinutes={queueData.estimatedWaitMinutes}
                      expectedCallTime={queueData.expectedCallTime}
                      patientsAhead={queueData.patientsAhead}
                      notificationsEnabled={notificationsEnabled}
                      onToggleNotifications={handleToggleNotifications}
                      t={t}
                    />

                    {/* Doctor Info */}
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">ChamberBox</span>
        </p>
      </footer>
    </div>
  );
};

export default QueueStatus;
