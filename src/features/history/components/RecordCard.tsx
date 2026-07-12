import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Chip, Icon, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { useDisclosure } from '@/hooks/useDisclosure'
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
  onDownload,
}: {
  record: MedicalRecordRow
  onDelete: (record: MedicalRecordRow) => void
  onDownload: (record: MedicalRecordRow) => Promise<string | null>
}) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { isOpen: expanded, toggle } = useDisclosure()
  const [downloading, setDownloading] = useState(false)
  const hasAttachment = record.category === 'document' && Boolean(record.attachment_url)

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const url = await onDownload(record)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={t(expanded ? 'history.collapseLabel' : 'history.expandLabel')}
          className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <p className={cn('text-base font-bold text-content', !expanded && 'truncate')}>
              {record.title}
            </p>
            <p className="text-sm text-content-variant">{formatDate(record.record_date, current)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Chip tone={CATEGORY_TONE[record.category]}>{t(`history.category.${record.category}`)}</Chip>
            <Icon
              name="chevronRight"
              size={20}
              className={cn(
                'text-content-variant transition-transform',
                expanded ? '-rotate-90' : 'rotate-90',
              )}
            />
          </div>
        </button>
        {hasAttachment && (
          <IconButton
            label={t('history.downloadLabel')}
            icon="download"
            iconSize={20}
            className="shrink-0 text-content-variant hover:text-primary"
            disabled={downloading}
            onClick={() => void handleDownload()}
          />
        )}
        <IconButton
          label={t('history.deleteLabel')}
          icon="trash"
          iconSize={20}
          className="shrink-0 text-content-variant hover:text-sos"
          onClick={() => onDelete(record)}
        />
      </div>
      {expanded && record.details && (
        <p className="mt-2 whitespace-pre-wrap text-base text-content-variant">{record.details}</p>
      )}
    </Card>
  )
}
