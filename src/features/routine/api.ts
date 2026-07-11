import type { AppSupabaseClient } from '@/lib/supabase'
import { todayISODate } from '@/lib/datetime'
import type { RoutineItemRow, RoutineLogRow, NewRoutineItem } from './types'

export async function fetchRoutineItems(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<RoutineItemRow[]> {
  const { data, error } = await supabase
    .from('routine_items')
    .select('*')
    .eq('circle_id', circleId)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchTodayRoutineLogs(
  supabase: AppSupabaseClient,
  circleId: string,
): Promise<RoutineLogRow[]> {
  const { data, error } = await supabase
    .from('routine_logs')
    .select('*')
    .eq('circle_id', circleId)
    .eq('log_date', todayISODate())
    .order('completed_at')
  if (error) throw error
  return data ?? []
}

export async function logCompletion(
  supabase: AppSupabaseClient,
  input: { circleId: string; routineItemId: string; userId: string; userName: string },
): Promise<void> {
  const { error } = await supabase.from('routine_logs').insert({
    circle_id: input.circleId,
    routine_item_id: input.routineItemId,
    log_date: todayISODate(),
    completed_at: new Date().toISOString(),
    completed_by: input.userId,
    completed_by_name: input.userName,
  })
  if (error) throw error
}

export async function undoLastCompletion(supabase: AppSupabaseClient, logId: string): Promise<void> {
  const { error } = await supabase.from('routine_logs').delete().eq('id', logId)
  if (error) throw error
}

export async function addRoutineItem(
  supabase: AppSupabaseClient,
  circleId: string,
  input: NewRoutineItem,
): Promise<void> {
  const { error } = await supabase.from('routine_items').insert({
    circle_id: circleId,
    type: input.type,
    name: input.name,
    target_count_per_day: input.targetCountPerDay,
    active: true,
  })
  if (error) throw error
}

/** Soft delete — keeps historical completion logs intact for later review. */
export async function removeRoutineItem(
  supabase: AppSupabaseClient,
  routineItemId: string,
): Promise<void> {
  const { error } = await supabase
    .from('routine_items')
    .update({ active: false })
    .eq('id', routineItemId)
  if (error) throw error
}
