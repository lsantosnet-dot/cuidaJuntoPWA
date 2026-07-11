import { useTranslation } from 'react-i18next'
import { Card, Chip, IconButton } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDate } from '@/lib/datetime'
import type { MedicalRecordRow, RecordCategory } from '../types'

const CATEGORY_TONE: Record<RecordCategory, 'teal' | 'sage' | 'sand' | 'neutral'> = {
  exam: 'teal',
  appointment: 'sage',
  document: 'sand',
  note: 'neutral',
}

export function RecordCard({
  record,
  onDelete,
}: {
  record: MedicalRecordRow
  onDelete: (record: MedicalRecordRow) => void
}) {
  const { t } = useTranslation()
  const { current } = useLanguage()

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-content">{record.title}</p>
          <p className="text-sm text-content-variant">{formatDate(record.record_date, current)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Chip tone={CATEGORY_TONE[record.category]}>{t(`history.category.${record.category}`)}</Chip>
          <IconButton
            label={t('history.deleteLabel')}
            icon="trash"
            iconSize={20}
            className="text-content-variant hover:text-sos"
            onClick={() => onDelete(record)}
          />
        </div>
      </div>
      {record.details && (
        <p className="mt-2 whitespace-pre-wrap text-base text-content-variant">{record.details}</p>
      )}
    </Card>
  )
}
