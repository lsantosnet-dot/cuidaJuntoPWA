import type { AppSupabaseClient } from '@/lib/supabase'
import { todayISODate } from '@/lib/datetime'
import type { MedicationRow, MedicationLogRow, NewMedication } from './types'

export async function fetchMedications(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<MedicationRow[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('circle_id', circleId)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchTodayLogs(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<MedicationLogRow[]> {
  const start = `${todayISODate()}T00:00:00`
  const end = `${todayISODate()}T23:59:59`
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('circle_id', circleId)
    .gte('scheduled_for', start)
    .lte('scheduled_for', end)
  if (error) throw error
  return data ?? []
}

export async function markDoseTaken(
  supabase: AppSupabaseClient,
  input: {
    circleId: string
    medicationId: string
    scheduledFor: string
    userId: string
    userName: string
  },
): Promise<void> {
  const { error } = await supabase.from('medication_logs').insert({
    circle_id: input.circleId,
    medication_id: input.medicationId,
    scheduled_for: input.scheduledFor,
    status: 'taken',
    taken_at: new Date().toISOString(),
    taken_by: input.userId,
    taken_by_name: input.userName,
  })
  if (error) throw error
}

export async function undoDose(supabase: AppSupabaseClient, logId: string): Promise<void> {
  const { error } = await supabase.from('medication_logs').delete().eq('id', logId)
  if (error) throw error
}

export async function addMedication(
  supabase: AppSupabaseClient,
  circleId: string,
  input: NewMedication,
): Promise<void> {
  const { error } = await supabase.from('medications').insert({
    circle_id: circleId,
    name: input.name,
    dosage: input.dosage || null,
    schedule_times: input.times,
    instructions: input.instructions || null,
    active: true,
  })
  if (error) throw error
}
