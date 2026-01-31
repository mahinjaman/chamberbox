import { useState, useEffect, useCallback } from 'react';
import { QueueData } from './types';

const MOCK_DOCTOR = {
  doctorName: 'Dr. Rafiqul Islam',
  chamberName: 'City Health Care',
  chamberAddress: 'House 45, Road 12, Dhanmondi, Dhaka',
  scheduleStart: '7:00 PM',
  scheduleEnd: '9:00 PM',
  avgConsultationTime: 5,
};

export const useQueueStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentSerial, setCurrentSerial] = useState(7);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment current serial (simulating queue progress)
      setCurrentSerial((prev) => {
        const shouldIncrement = Math.random() > 0.7;
        return shouldIncrement ? prev + 1 : prev;
      });
      setLastUpdated(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Update queue data when current serial changes
  useEffect(() => {
    if (queueData) {
      const patientsAhead = Math.max(0, queueData.patientSerial - currentSerial);
      const estimatedWaitMinutes = patientsAhead * MOCK_DOCTOR.avgConsultationTime;
      const expectedCallTime = new Date();
      expectedCallTime.setMinutes(expectedCallTime.getMinutes() + estimatedWaitMinutes);

      setQueueData((prev) =>
        prev
          ? {
              ...prev,
              currentSerial,
              patientsAhead,
              estimatedWaitMinutes,
              expectedCallTime,
              lastUpdated: new Date(),
              queueStatus: currentSerial >= prev.patientSerial ? 'closed' : 'running',
            }
          : null
      );
    }
  }, [currentSerial]);

  const checkStatus = useCallback(
    async (serialNumber: number, patientName?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validation
      if (serialNumber <= 0 || serialNumber > 100) {
        setError('invalid');
        setIsLoading(false);
        return;
      }

      if (serialNumber < currentSerial) {
        setError('already_seen');
        setIsLoading(false);
        return;
      }

      // Simulate random network error (5% chance)
      if (Math.random() < 0.05) {
        setError('network');
        setIsLoading(false);
        return;
      }

      const patientsAhead = Math.max(0, serialNumber - currentSerial);
      const estimatedWaitMinutes = patientsAhead * MOCK_DOCTOR.avgConsultationTime;
      const expectedCallTime = new Date();
      expectedCallTime.setMinutes(expectedCallTime.getMinutes() + estimatedWaitMinutes);

      // Randomly set queue status for demo
      const statuses: Array<'running' | 'break' | 'closed'> = ['running', 'running', 'running', 'break'];
      const queueStatus = statuses[Math.floor(Math.random() * statuses.length)];

      setQueueData({
        currentSerial,
        patientSerial: serialNumber,
        patientName,
        patientsAhead,
        estimatedWaitMinutes,
        avgConsultationTime: MOCK_DOCTOR.avgConsultationTime,
        queueStatus,
        ...MOCK_DOCTOR,
        lastUpdated: new Date(),
        expectedCallTime,
      });

      // Save to localStorage
      localStorage.setItem('queue_serial', serialNumber.toString());
      if (patientName) {
        localStorage.setItem('queue_patient_name', patientName);
      }

      setIsLoading(false);
    },
    [currentSerial]
  );

  const refresh = useCallback(async () => {
    if (queueData) {
      await checkStatus(queueData.patientSerial, queueData.patientName);
    }
  }, [queueData, checkStatus]);

  return {
    isLoading,
    error,
    queueData,
    lastUpdated,
    checkStatus,
    refresh,
    setError,
  };
};
