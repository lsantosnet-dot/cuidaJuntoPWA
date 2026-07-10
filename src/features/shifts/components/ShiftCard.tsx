import { useTranslation } from 'react-i18next'
import { Card, Avatar, Chip, Button } from '@/components/ui'
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
  busy,
}: {
  shift: ShiftRow
  onEnd: (id: string) => void
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
            <Button variant="ghost" size="md" onClick={() => onEnd(shift.id)} disabled={busy}>
              {t('shifts.end')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
