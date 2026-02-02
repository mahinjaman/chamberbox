import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueueData } from './types';
import { format } from 'date-fns';

type SearchMode = 'phone' | 'serial' | 'phone_date';

interface SearchParams {
  mode: SearchMode;
  phoneNumber?: string;
  serialNumber?: string;
  date?: string;
}

export const useQueueStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  // Search by unique serial number (booking reference)
  const checkBySerialNumber = useCallback(async (serialNumber: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSearchParams({ mode: 'serial', serialNumber });

    try {
      // Find queue token by serial number
      const { data: token, error: tokenError } = await supabase
        .from('queue_tokens')
        .select(`
          id,
          token_number,
          serial_number,
          status,
          session_id,
          doctor_id,
          patient_id,
          queue_date
        `)
        .eq('serial_number', serialNumber.toUpperCase())
        .single();

      if (tokenError || !token) {
        setError('notFound');
        setIsLoading(false);
        return;
      }

      // Check if already completed
      if (token.status === 'completed') {
        setError('already_seen');
        setIsLoading(false);
        return;
      }

      if (token.status === 'cancelled') {
        setError('notFound');
        setIsLoading(false);
        return;
      }

      // Get patient info
      const { data: patient } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('id', token.patient_id)
        .single();

      await fetchAndSetQueueData(token, patient);
    } catch (err) {
      console.error('Queue status error:', err);
      setError('network');
      setIsLoading(false);
    }
  }, []);

  // Search by phone number for today (legacy mode)
  const checkStatus = useCallback(
    async (phoneNumber: string, serialNumber?: number): Promise<void> => {
      setIsLoading(true);
      setError(null);
      const today = format(new Date(), 'yyyy-MM-dd');
      setSearchParams({ mode: 'phone', phoneNumber, date: today });

      try {
        await searchByPhoneAndDate(phoneNumber, today, serialNumber);
      } catch (err) {
        console.error('Queue status error:', err);
        setError('network');
        setIsLoading(false);
      }
    },
    []
  );

  // Search by phone number and specific date
  const checkByPhoneAndDate = useCallback(
    async (phoneNumber: string, date: Date): Promise<void> => {
      setIsLoading(true);
      setError(null);
      const dateStr = format(date, 'yyyy-MM-dd');
      setSearchParams({ mode: 'phone_date', phoneNumber, date: dateStr });

      try {
        await searchByPhoneAndDate(phoneNumber, dateStr);
      } catch (err) {
        console.error('Queue status error:', err);
        setError('network');
        setIsLoading(false);
      }
    },
    []
  );

  // Common function to search by phone and date
  const searchByPhoneAndDate = async (phoneNumber: string, dateStr: string, tokenNum?: number) => {
    // Find patients by phone
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

    // Find queue token for the date with this patient
    let tokenQuery = supabase
      .from('queue_tokens')
      .select(`
        id,
        token_number,
        serial_number,
        status,
        session_id,
        doctor_id,
        patient_id,
        queue_date
      `)
      .in('patient_id', patientIds)
      .eq('queue_date', dateStr)
      .in('status', ['waiting', 'current']);

    if (tokenNum) {
      tokenQuery = tokenQuery.eq('token_number', tokenNum);
    }
    
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
        .eq('queue_date', dateStr)
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

    await fetchAndSetQueueData(token, patient ? { ...patient, phone: phoneNumber } : null);
  };

  // Fetch full queue data and set state
  const fetchAndSetQueueData = async (
    token: {
      id: string;
      token_number: number;
      serial_number: string | null;
      status: string | null;
      session_id: string | null;
      doctor_id: string;
      patient_id: string;
      queue_date: string;
    },
    patient: { id: string; name: string; phone?: string } | null
  ) => {
    // Handle tokens without session (legacy tokens)
    if (!token.session_id) {
      const { data: doctor } = await supabase
        .from('profiles')
        .select('id, full_name, specialization')
        .eq('id', token.doctor_id)
        .single();

      setQueueData({
        currentSerial: 0,
        patientSerial: token.token_number,
        serialNumber: token.serial_number || undefined,
        patientName: patient?.name,
        patientPhone: patient?.phone || '',
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

    // Count patients ahead
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
      serialNumber: token.serial_number || undefined,
      patientName: patient?.name,
      patientPhone: patient?.phone || '',
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

    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const refresh = useCallback(async () => {
    if (!searchParams) return;
    
    if (searchParams.mode === 'serial' && searchParams.serialNumber) {
      await checkBySerialNumber(searchParams.serialNumber);
    } else if (searchParams.mode === 'phone_date' && searchParams.phoneNumber && searchParams.date) {
      await checkByPhoneAndDate(searchParams.phoneNumber, new Date(searchParams.date));
    } else if (searchParams.mode === 'phone' && searchParams.phoneNumber) {
      await checkStatus(searchParams.phoneNumber);
    }
  }, [searchParams, checkBySerialNumber, checkByPhoneAndDate, checkStatus]);

  return {
    isLoading,
    error,
    queueData,
    lastUpdated,
    checkStatus,
    checkBySerialNumber,
    checkByPhoneAndDate,
    refresh,
    setError,
  };
};
