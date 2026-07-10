import type { MedicalRecordRow, RecordCategory } from '@/lib/database.types'

export type { MedicalRecordRow, RecordCategory }

export const CATEGORY_OPTIONS: RecordCategory[] = ['exam', 'appointment', 'document', 'note']

export interface NewRecord {
  title: string
  category: RecordCategory
  recordDate: string
  details: string
}
