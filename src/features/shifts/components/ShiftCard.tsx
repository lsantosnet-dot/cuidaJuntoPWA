import { useTranslation } from 'react-i18next'
import { Card, Avatar, Chip, Button, IconButton } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDayLabel, formatTime } from '@/lib/datetime'
import type { ShiftRow } from '../types'

const STATUS_TONE = {
  active: 'teal',
  scheduled: 'sand',
  ended: 'neutral',
} as const

export function ShiftCard({
  shift,
  onEnd,
  onDelete,
  busy,
}: {
  shift: ShiftRow
  onEnd: (id: string) => void
  /** Omit to hide the delete action (e.g. dashboard preview tiles). */
  onDelete?: (shift: ShiftRow) => void
  busy?: boolean
}) {
  const { t } = useTranslation()
  const { current } = useLanguage()

  const range = `${formatTime(shift.starts_at, current)}${
    shift.ends_at ? ` – ${formatTime(shift.ends_at, current)}` : ''
  }`

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar name={shift.caregiver_name ?? '?'} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-content">{shift.caregiver_name}</p>
          <p className="text-sm text-content-variant">
            {formatDayLabel(shift.starts_at, current)} · {range}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Chip tone={STATUS_TONE[shift.status]}>{t(`shifts.status.${shift.status}`)}</Chip>
          {shift.status === 'active' && (
            <Button variant="ghost" size="md" onClick={() => onEnd(shift.id)} loading={busy}>
              {t('shifts.end')}
            </Button>
          )}
        </div>
        {onDelete && (
          <IconButton
            label={t('shifts.deleteLabel')}
            icon="trash"
            iconSize={20}
            className="shrink-0 text-content-variant hover:text-sos"
            onClick={() => onDelete(shift)}
            disabled={busy}
          />
        )}
      </div>
    </Card>
  )
}
