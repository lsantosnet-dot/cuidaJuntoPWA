import type { ShiftRow } from '@/lib/database.types'

export type { ShiftRow }

export interface NewShift {
  caregiverName: string
  startsAt: string
  endsAt: string | null
}
