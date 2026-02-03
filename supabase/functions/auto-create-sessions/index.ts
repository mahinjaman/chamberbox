import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AvailabilitySlot {
  id: string
  chamber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  slot_duration_minutes: number | null
}

interface Chamber {
  id: string
  doctor_id: string
  name: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get only ACTIVE chambers - inactive chambers should not have sessions auto-created
    const { data: chambers, error: chambersError } = await supabase
      .from('chambers')
      .select('id, doctor_id, name')
      .eq('is_active', true)
    
    if (chambersError) throw chambersError
    if (!chambers || chambers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active chambers found', sessions_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active availability slots
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('is_active', true)
    
    if (slotsError) throw slotsError
    if (!slots || slots.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No availability slots found', sessions_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate dates for the next 16 days
    const today = new Date()
    const dates: { date: string; dayOfWeek: number }[] = []
    
    for (let i = 0; i < 16; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      dates.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay(),
      })
    }

    // Get existing sessions for the date range
    const dateFrom = dates[0].date
    const dateTo = dates[dates.length - 1].date
    
    const { data: existingSessions, error: sessionsError } = await supabase
      .from('queue_sessions')
      .select('chamber_id, session_date, start_time')
      .gte('session_date', dateFrom)
      .lte('session_date', dateTo)
    
    if (sessionsError) throw sessionsError

    // Build a set of existing sessions for quick lookup
    const existingSet = new Set(
      (existingSessions || []).map(s => 
        `${s.chamber_id}-${s.session_date}-${s.start_time.slice(0, 5)}`
      )
    )

    // Group slots by chamber
    const slotsByChamber: Record<string, AvailabilitySlot[]> = {}
    slots.forEach(slot => {
      if (!slotsByChamber[slot.chamber_id]) {
        slotsByChamber[slot.chamber_id] = []
      }
      slotsByChamber[slot.chamber_id].push(slot)
    })

    // Prepare sessions to create
    const sessionsToCreate: any[] = []

    for (const chamber of chambers) {
      const chamberSlots = slotsByChamber[chamber.id] || []
      
      for (const dateInfo of dates) {
        // Find slots for this day of week
        const daySlots = chamberSlots.filter(s => s.day_of_week === dateInfo.dayOfWeek)
        
        for (const slot of daySlots) {
          const key = `${chamber.id}-${dateInfo.date}-${slot.start_time.slice(0, 5)}`
          
          // Skip if session already exists
          if (existingSet.has(key)) continue
          
          sessionsToCreate.push({
            doctor_id: chamber.doctor_id,
            chamber_id: chamber.id,
            session_date: dateInfo.date,
            start_time: slot.start_time.slice(0, 5),
            end_time: slot.end_time.slice(0, 5),
            status: 'open',
            current_token: 0,
            max_patients: 30,
            avg_consultation_minutes: slot.slot_duration_minutes || 5,
            is_custom: false,
          })
        }
      }
    }

    // Insert new sessions in batches
    let sessionsCreated = 0
    const batchSize = 100
    
    for (let i = 0; i < sessionsToCreate.length; i += batchSize) {
      const batch = sessionsToCreate.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('queue_sessions')
        .insert(batch)
      
      if (insertError) {
        console.error('Error inserting batch:', insertError)
      } else {
        sessionsCreated += batch.length
      }
    }

    console.log(`Auto-created ${sessionsCreated} sessions for next 16 days`)

    return new Response(
      JSON.stringify({ 
        message: 'Sessions auto-created successfully',
        sessions_created: sessionsCreated,
        date_range: { from: dateFrom, to: dateTo }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error in auto-create-sessions:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
