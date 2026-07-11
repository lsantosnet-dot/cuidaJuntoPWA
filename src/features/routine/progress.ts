import { todayISODate } from '@/lib/datetime'
import type { RoutineItemRow, RoutineLogRow, RoutineProgress } from './types'

/**
 * Pairs each active item with today's completion count, matching logs by
 * item id and log_date. Pure — shared by both the Supabase and demo data paths.
 */
export function buildProgress(items: RoutineItemRow[], logs: RoutineLogRow[]): RoutineProgress[] {
  const today = todayISODate()
  return items.map((item) => {
    const todayLogs = logs.filter((l) => l.routine_item_id === item.id && l.log_date === today)
    return {
      item,
      doneCount: todayLogs.length,
      target: item.target_count_per_day,
      logIds: todayLogs.map((l) => l.id),
    }
  })
}
