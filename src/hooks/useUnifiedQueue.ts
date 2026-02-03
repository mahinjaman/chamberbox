import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";
import { format, addDays, startOfDay, isSameDay, isAfter } from "date-fns";

export interface AvailableSlot {
  chamber_id: string;
  chamber_name: string;
  chamber_address: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  new_patient_fee: number;
  return_patient_fee: number;
}

export interface BookingSlot {
  date: string;
  chamber_id: string;
  chamber_name: string;
  chamber_address: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  new_patient_fee: number;
  return_patient_fee: number;
  current_bookings: number;
  max_patients: number;
  is_available: boolean;
  session_id?: string;
  session_status?: string;
  booking_open?: boolean;
}

export interface QueueBooking {
  id: string;
  doctor_id: string;
  patient_id: string;
  session_id: string | null;
  chamber_id: string;
  token_number: number;
  queue_date: string;
  status: "waiting" | "current" | "completed" | "cancelled";
  estimated_time: string | null;
  called_at: string | null;
  completed_at: string | null;
  booked_by: "internal" | "public";
  created_at: string;
  patient?: {
    name: string;
    phone: string;
    age: number | null;
    gender: string | null;
  };
  chamber?: {
    name: string;
    address: string;
  };
}

export interface CreateBookingInput {
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age?: number;
  patient_gender?: string;
  chamber_id: string;
  queue_date: string;
  session_id?: string;
  is_public?: boolean;
  visiting_reason?: string;
  is_follow_up?: boolean;
}

// Hook to get available booking slots for a doctor
export const useAvailableSlots = (doctorId: string, startDate?: Date, days: number = 14) => {
  const start = startDate || new Date();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["available_slots", doctorId, format(start, "yyyy-MM-dd"), days],
    queryFn: async (): Promise<BookingSlot[]> => {
      if (!doctorId) return [];

      // Get chambers
      const { data: chambers, error: chambersError } = await supabase
        .from("chambers")
        .select(`id, name, address, new_patient_fee, return_patient_fee`)
        .eq("doctor_id", doctorId);

      if (chambersError) throw chambersError;
      if (!chambers || chambers.length === 0) return [];

      // Get availability slots for these chambers
      const chamberIds = chambers.map(c => c.id);
      const { data: availabilitySlots, error: slotsError } = await supabase
        .from("availability_slots")
        .select("*")
        .in("chamber_id", chamberIds)
        .eq("is_active", true);

      if (slotsError) throw slotsError;

      // Get existing sessions for the date range
      const dateFrom = format(start, "yyyy-MM-dd");
      const dateTo = format(addDays(start, days - 1), "yyyy-MM-dd");

      // Include open, running, paused, and closed sessions to properly filter availability
      const { data: sessions } = await supabase
        .from("queue_sessions")
        .select("id, chamber_id, session_date, start_time, end_time, status, max_patients, current_token, booking_open")
        .eq("doctor_id", doctorId)
        .gte("session_date", dateFrom)
        .lte("session_date", dateTo);

      // Get token counts for sessions (only count waiting/current, NOT completed/cancelled)
      // Only count tokens from open/running/paused sessions
      const activeSessionIds = sessions?.filter(s => s.status !== "closed").map(s => s.id) || [];
      let tokenCounts: Record<string, number> = {};

      if (activeSessionIds.length > 0) {
        const { data: tokens } = await supabase
          .from("queue_tokens")
          .select("session_id")
          .in("session_id", activeSessionIds)
          .in("status", ["waiting", "current"]); // Only count active tokens

        tokens?.forEach(t => {
          if (t.session_id) {
            tokenCounts[t.session_id] = (tokenCounts[t.session_id] || 0) + 1;
          }
        });
      }

      // Generate available slots for each day
      const result: BookingSlot[] = [];
      const today = startOfDay(new Date());

      for (let i = 0; i < days; i++) {
        const date = addDays(start, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayOfWeek = date.getDay();

        // Skip past dates (except today)
        if (!isAfter(date, today) && !isSameDay(date, today)) continue;

        // Check each chamber's availability for this day
        chambers.forEach(chamber => {
          const daySlots = availabilitySlots?.filter(
            (s) => s.chamber_id === chamber.id && s.day_of_week === dayOfWeek
          ) || [];

          daySlots.forEach((slot) => {
            // Check if session already exists for this slot
            const existingSession = sessions?.find(
              s => s.chamber_id === chamber.id &&
                   s.session_date === dateStr &&
                   s.start_time.slice(0, 5) === slot.start_time.slice(0, 5)
            );

            const currentBookings = existingSession ? (tokenCounts[existingSession.id] || 0) : 0;
            const maxPatients = existingSession?.max_patients || 30;
            const isSessionClosed = existingSession?.status === "closed";
            // Check if booking is manually closed by doctor
            const isBookingClosed = existingSession?.booking_open === false;
            
            // Skip closed sessions entirely - don't show them as available slots
            if (isSessionClosed) return;

            result.push({
              date: dateStr,
              chamber_id: chamber.id,
              chamber_name: chamber.name,
              chamber_address: chamber.address,
              start_time: slot.start_time.slice(0, 5),
              end_time: slot.end_time.slice(0, 5),
              slot_duration_minutes: slot.slot_duration_minutes || 15,
              new_patient_fee: chamber.new_patient_fee || 500,
              return_patient_fee: chamber.return_patient_fee || 300,
              current_bookings: currentBookings,
              max_patients: maxPatients,
              is_available: !isSessionClosed && !isBookingClosed && currentBookings < maxPatients,
              session_id: existingSession?.id,
              booking_open: existingSession?.booking_open ?? true,
              session_status: existingSession?.status,
            });
          });
        });
      }

      // Sort by date, then by start time
      return result.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.start_time.localeCompare(b.start_time);
      });
    },
    enabled: !!doctorId,
    staleTime: 30000, // Cache for 30 seconds
  });

  return { slots, isLoading };
};

// Hook to create a queue booking
export const useCreateQueueBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const { doctor_id, patient_name, patient_phone, patient_age, patient_gender, chamber_id, queue_date, session_id, is_public } = input;

      // First, check if patient exists for this doctor
      const phone = patient_phone.replace(/\D/g, "");
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("doctor_id", doctor_id)
        .eq("phone", phone)
        .maybeSingle();

      let patientId: string;

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const patientData: any = {
          doctor_id,
          name: patient_name.trim(),
          phone,
        };
        if (patient_age) patientData.age = patient_age;
        if (patient_gender) patientData.gender = patient_gender;

        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert(patientData)
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      // Ensure a session exists for this slot (find matching session for public bookings)
      let activeSessionId = session_id;

      if (!activeSessionId) {
        // Find any open/running/paused session for this doctor, chamber, and date
        // This ensures public bookings get linked to the right session
        const { data: existingSession } = await supabase
          .from("queue_sessions")
          .select("id, start_time, end_time")
          .eq("doctor_id", doctor_id)
          .eq("chamber_id", chamber_id)
          .eq("session_date", queue_date)
          .in("status", ["open", "running", "paused"])
          .order("start_time", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (existingSession) {
          activeSessionId = existingSession.id;
        }
      }

      // Create queue token - token_number is auto-generated by database trigger
      const { data: token, error: tokenError } = await supabase
        .from("queue_tokens")
        .insert({
          doctor_id,
          patient_id: patientId,
          session_id: activeSessionId,
          chamber_id,
          queue_date,
          token_number: 0, // Will be overwritten by trigger
          status: "waiting",
          booked_by: is_public ? "public" : "internal",
          visiting_reason: input.visiting_reason || null,
        })
        .select(`
          *,
          patient:patients(name, phone, age, gender),
          chamber:chambers(name, address)
        `)
        .single();

      if (tokenError) throw tokenError;

      // Count actual waiting patients ahead (excluding completed/cancelled)
      const { count: waitingAhead } = await supabase
        .from("queue_tokens")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", doctor_id)
        .eq("queue_date", queue_date)
        .eq("chamber_id", chamber_id)
        .in("status", ["waiting", "current"])
        .lt("token_number", token.token_number);

      return { ...token, waiting_ahead: waitingAhead || 0 } as QueueBooking & { waiting_ahead: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["available_slots"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["queue_sessions"] });
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
};

// Hook for public profile to get slots for a specific doctor (16 days booking window)
export const usePublicBookingSlots = (doctorId: string) => {
  return useAvailableSlots(doctorId, new Date(), 16);
};

// Hook to check if a doctor can accept new patients (for public booking)
export const useDoctorBookingStatus = (doctorId: string) => {
  return useQuery({
    queryKey: ["doctor_booking_status", doctorId],
    queryFn: async () => {
      if (!doctorId) return { canBook: true, message: "" };

      // Get doctor's profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_expires_at")
        .eq("id", doctorId)
        .single();

      if (profileError) throw profileError;

      // Check if subscription is expired
      if (profile.subscription_expires_at) {
        const expiresAt = new Date(profile.subscription_expires_at);
        if (expiresAt < new Date()) {
          return { 
            canBook: false, 
            message: "This doctor's booking system is currently unavailable.",
            reason: "expired"
          };
        }
      }

      // Get subscription plan limits
      const tier = profile.subscription_tier || "trial";
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("max_patients")
        .eq("tier", tier)
        .single();

      if (planError) {
        console.error("Error fetching plan:", planError);
        return { canBook: true, message: "" }; // Allow booking if can't fetch plan
      }

      // If unlimited patients, allow booking
      if (plan.max_patients === -1) {
        return { canBook: true, message: "" };
      }

      // Get current patient count for this doctor
      const { count, error: countError } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doctorId);

      if (countError) {
        console.error("Error counting patients:", countError);
        return { canBook: true, message: "" }; // Allow booking if can't count
      }

      // Check if limit is reached
      if (count !== null && count >= plan.max_patients) {
        return { 
          canBook: false, 
          message: "This doctor is not accepting new patients at the moment. Please try again later.",
          reason: "limit_reached"
        };
      }

      return { canBook: true, message: "" };
    },
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
