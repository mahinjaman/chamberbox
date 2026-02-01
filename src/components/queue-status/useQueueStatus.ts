import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueueData } from './types';
import { format } from 'date-fns';

interface CheckStatusParams {
  phoneNumber: string;
  serialNumber?: number;
}

export const useQueueStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchParams, setSearchParams] = useState<CheckStatusParams | null>(null);

  const checkStatus = useCallback(
    async (phoneNumber: string, serialNumber?: number): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setSearchParams({ phoneNumber, serialNumber });

      try {
        const today = format(new Date(), 'yyyy-MM-dd');

        // First, find the patient by phone number
        const { data: patients, error: patientError } = await supabase
          .from('patients')
          .select('id, name')
          .eq('phone', phoneNumber);

        if (patientError) {
          console.error('Patient lookup error:', patientError);
          setError('network');
          setIsLoading(false);
          return;
        }

        if (!patients || patients.length === 0) {
          setError('notFound');
          setIsLoading(false);
          return;
        }

        const patientIds = patients.map(p => p.id);

        // Find queue token for today with this patient
        // Build the query - if serial number provided, look for that specific token
        // Otherwise, find any active token for this patient
        let tokenQuery = supabase
          .from('queue_tokens')
          .select(`
            id,
            token_number,
            status,
            session_id,
            doctor_id,
            patient_id,
            queue_date
          `)
          .in('patient_id', patientIds)
          .eq('queue_date', today)
          .in('status', ['waiting', 'current']);

        // If serial number provided, filter by it
        if (serialNumber) {
          tokenQuery = tokenQuery.eq('token_number', serialNumber);
        }
        
        // Order by token number descending to get the latest token first
        tokenQuery = tokenQuery.order('token_number', { ascending: false }).limit(1);

        const { data: tokens, error: tokenError } = await tokenQuery;

        if (tokenError) {
          console.error('Token lookup error:', tokenError);
          setError('network');
          setIsLoading(false);
          return;
        }

        if (!tokens || tokens.length === 0) {
          // Check if token exists but is completed
          const { data: completedTokens } = await supabase
            .from('queue_tokens')
            .select('status')
            .in('patient_id', patientIds)
            .eq('queue_date', today)
            .eq('status', 'completed')
            .limit(1);

          if (completedTokens && completedTokens.length > 0) {
            setError('already_seen');
          } else {
            setError('notFound');
          }
          setIsLoading(false);
          return;
        }

        const token = tokens[0];
        const patient = patients.find(p => p.id === token.patient_id);

        // Handle tokens without session (legacy tokens)
        if (!token.session_id) {
          // For legacy tokens without session, show basic info
          const { data: doctor } = await supabase
            .from('profiles')
            .select('id, full_name, specialization')
            .eq('id', token.doctor_id)
            .single();

          setQueueData({
            currentSerial: 0,
            patientSerial: token.token_number,
            patientName: patient?.name,
            patientPhone: phoneNumber,
            patientsAhead: 0,
            estimatedWaitMinutes: 0,
            avgConsultationTime: 5,
            queueStatus: 'waiting',
            doctorName: doctor?.full_name || 'Doctor',
            chamberName: '',
            chamberAddress: '',
            scheduleStart: '',
            scheduleEnd: '',
            lastUpdated: new Date(),
            expectedCallTime: new Date(),
            sessionId: '',
            tokenStatus: token.status || 'waiting',
          });

          localStorage.setItem('queue_phone', phoneNumber);
          setLastUpdated(new Date());
          setIsLoading(false);
          return;
        }

        // Get session details
        const { data: session, error: sessionError } = await supabase
          .from('queue_sessions')
          .select(`
            id,
            status,
            current_token,
            avg_consultation_minutes,
            start_time,
            end_time,
            chamber_id
          `)
          .eq('id', token.session_id)
          .single();

        if (sessionError || !session) {
          console.error('Session lookup error:', sessionError);
          setError('network');
          setIsLoading(false);
          return;
        }

        // Get chamber details
        const { data: chamber, error: chamberError } = await supabase
          .from('chambers')
          .select('id, name, address, doctor_id')
          .eq('id', session.chamber_id)
          .single();

        if (chamberError || !chamber) {
          console.error('Chamber lookup error:', chamberError);
          setError('network');
          setIsLoading(false);
          return;
        }

        // Get doctor details
        const { data: doctor, error: doctorError } = await supabase
          .from('profiles')
          .select('id, full_name, specialization')
          .eq('id', chamber.doctor_id)
          .single();

        if (doctorError || !doctor) {
          console.error('Doctor lookup error:', doctorError);
          setError('network');
          setIsLoading(false);
          return;
        }

        // Count patients ahead (use 'current' instead of 'called')
        const { count: patientsAhead } = await supabase
          .from('queue_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', token.session_id)
          .in('status', ['waiting', 'current'])
          .lt('token_number', token.token_number);

        const ahead = patientsAhead || 0;
        const avgTime = session.avg_consultation_minutes || 5;
        const estimatedWaitMinutes = ahead * avgTime;
        const expectedCallTime = new Date();
        expectedCallTime.setMinutes(expectedCallTime.getMinutes() + estimatedWaitMinutes);

        // Determine queue status
        let queueStatus: 'running' | 'break' | 'closed' | 'waiting' = 'waiting';
        if (session.status === 'running') {
          queueStatus = 'running';
        } else if (session.status === 'closed' || session.status === 'completed') {
          queueStatus = 'closed';
        } else if (session.status === 'open') {
          queueStatus = 'waiting';
        }

        setQueueData({
          currentSerial: session.current_token || 0,
          patientSerial: token.token_number,
          patientName: patient?.name,
          patientPhone: phoneNumber,
          patientsAhead: ahead,
          estimatedWaitMinutes,
          avgConsultationTime: avgTime,
          queueStatus,
          doctorName: doctor.full_name,
          chamberName: chamber.name,
          chamberAddress: chamber.address,
          scheduleStart: session.start_time,
          scheduleEnd: session.end_time,
          lastUpdated: new Date(),
          expectedCallTime,
          sessionId: session.id,
          tokenStatus: token.status || 'waiting',
        });

        // Save to localStorage
        localStorage.setItem('queue_phone', phoneNumber);
        if (serialNumber) {
          localStorage.setItem('queue_serial', serialNumber.toString());
        }

        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (err) {
        console.error('Queue status error:', err);
        setError('network');
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (searchParams) {
      await checkStatus(searchParams.phoneNumber, searchParams.serialNumber);
    }
  }, [searchParams, checkStatus]);

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
