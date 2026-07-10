import { useTranslation } from 'react-i18next'
import { Card, Chip } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDate } from '@/lib/datetime'
import type { MedicalRecordRow, RecordCategory } from '../types'

const CATEGORY_TONE: Record<RecordCategory, 'teal' | 'sage' | 'sand' | 'neutral'> = {
  exam: 'teal',
  appointment: 'sage',
  document: 'sand',
  note: 'neutral',
}

export function RecordCard({ record }: { record: MedicalRecordRow }) {
  const { t } = useTranslation()
  const { current } = useLanguage()

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-content">{record.title}</p>
          <p className="text-sm text-content-variant">{formatDate(record.record_date, current)}</p>
        </div>
        <Chip tone={CATEGORY_TONE[record.category]}>{t(`history.category.${record.category}`)}</Chip>
      </div>
      {record.details && (
        <p className="mt-2 whitespace-pre-wrap text-base text-content-variant">{record.details}</p>
      )}
    </Card>
  )
}
