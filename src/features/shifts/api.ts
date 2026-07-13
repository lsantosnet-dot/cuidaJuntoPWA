import type { AppSupabaseClient } from '@/lib/supabase'
import type { ShiftRow, NewShift } from './types'

export async function fetchShifts(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<ShiftRow[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('circle_id', circleId)
    .order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Ends any currently active shift, then starts a fresh one for the caller. */
export async function assumeShift(
  supabase: AppSupabaseClient,
  input: { circleId: string; userId: string; userName: string },
): Promise<void> {
  const now = new Date().toISOString()
  const ended = await supabase
    .from('shifts')
    .update({ status: 'ended', ends_at: now })
    .eq('circle_id', input.circleId)
    .eq('status', 'active')
  if (ended.error) throw ended.error

  const { error } = await supabase.from('shifts').insert({
    circle_id: input.circleId,
    caregiver_id: input.userId,
    caregiver_name: input.userName,
    starts_at: now,
    status: 'active',
  })
  if (error) throw error
}

export async function endShift(supabase: AppSupabaseClient, shiftId: string): Promise<void> {
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'ended', ends_at: new Date().toISOString() })
    .eq('id', shiftId)
  if (error) throw error
}

export async function deleteShift(supabase: AppSupabaseClient, shiftId: string): Promise<void> {
  const { error } = await supabase.from('shifts').delete().eq('id', shiftId)
  if (error) throw error
}

export async function addShift(
  supabase: AppSupabaseClient,
  circleId: string,
  input: NewShift,
): Promise<void> {
  const { error } = await supabase.from('shifts').insert({
    circle_id: circleId,
    caregiver_name: input.caregiverName,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: 'scheduled',
  })
  if (error) throw error
}
