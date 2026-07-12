import type { MedicalRecordRow, RecordCategory } from '@/lib/database.types'

export type { MedicalRecordRow, RecordCategory }

export const CATEGORY_OPTIONS: RecordCategory[] = ['exam', 'appointment', 'document', 'note']

export interface NewRecord {
  title: string
  category: RecordCategory
  recordDate: string
  details: string
  attachment: File | null
}

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

export const ATTACHMENT_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
