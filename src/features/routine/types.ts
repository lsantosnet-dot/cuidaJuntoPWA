import type { RoutineItemRow, RoutineLogRow, RoutineType } from '@/lib/database.types'

export type { RoutineItemRow, RoutineLogRow, RoutineType }

/** An item's completion state for today, derived from the item + today's logs. */
export interface RoutineProgress {
  item: RoutineItemRow
  doneCount: number
  target: number
  /** Chronological ids of today's completions, used to undo the most recent one. */
  logIds: string[]
}

export interface NewRoutineItem {
  name: string
  type: RoutineType
  targetCountPerDay: number
}
