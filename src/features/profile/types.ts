import type { CareRecipientRow } from '@/lib/database.types'

export type { CareRecipientRow }

export interface EditRecipient {
  name: string
  conditions: string[]
  notes: string
  birthDate: string | null
}
