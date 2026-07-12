import type { CareRecipientRow } from '@/features/profile/types'
import type { MedicationRow } from '@/features/medications/types'
import type { MedicalRecordRow } from '@/features/history/types'
import type { DiaryEntryRow } from '@/features/diary/types'
import type { RoutineItemRow } from '@/features/routine/types'

export interface ReportData {
  recipient: CareRecipientRow | null
  medications: MedicationRow[]
  records: MedicalRecordRow[]
  diary: DiaryEntryRow[]
  routineItems: RoutineItemRow[]
}
