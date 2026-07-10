import type { MedicationRow, MedicationLogRow } from '@/lib/database.types'

export type { MedicationRow, MedicationLogRow }

/** A single scheduled intake for today, derived from a medication + its log. */
export interface Dose {
  key: string
  medicationId: string
  name: string
  dosage: string | null
  instructions: string | null
  /** "HH:mm" scheduled time. */
  time: string
  /** ISO timestamp for today at `time`. */
  scheduledFor: string
  status: 'pending' | 'taken'
  logId?: string
  takenByName?: string | null
  takenAt?: string | null
}

export interface NewMedication {
  name: string
  dosage: string
  times: string[]
  instructions: string
}
