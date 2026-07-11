import { useTranslation } from 'react-i18next'
import { Button, Icon, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { formatTime } from '@/lib/datetime'
import type { Dose } from '../types'

interface DoseCardProps {
  dose: Dose
  onMarkTaken: (dose: Dose) => void
  onUndo: (dose: Dose) => void
  /** Omit to hide the delete action (e.g. dashboard preview tiles). */
  onDelete?: (dose: Dose) => void
  busy?: boolean
}

/** Medication dose card with a left status strip (green taken / amber pending). */
export function DoseCard({ dose, onMarkTaken, onUndo, onDelete, busy }: DoseCardProps) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const taken = dose.status === 'taken'

  return (
    <div className="flex overflow-hidden rounded-card bg-surface-lowest shadow-card dark:ring-1 dark:ring-white/10">
      <span className={cn('w-1.5 shrink-0', taken ? 'bg-secondary' : 'bg-tertiary')} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-content">{dose.time}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-content">
            {dose.name}
            {dose.dosage && <span className="font-normal text-content-variant"> · {dose.dosage}</span>}
          </p>
          {taken ? (
            <p className="truncate text-sm text-secondary">
              {t('medications.takenBy', {
                name: dose.takenByName ?? '',
                time: dose.takenAt ? formatTime(dose.takenAt, current) : '',
              })}
            </p>
          ) : (
            dose.instructions && (
              <p className="truncate text-sm text-content-variant">{dose.instructions}</p>
            )
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {taken ? (
            <Button variant="outline" size="md" onClick={() => onUndo(dose)} disabled={busy}>
              {t('medications.undo')}
            </Button>
          ) : (
            <Button
              size="md"
              onClick={() => onMarkTaken(dose)}
              disabled={busy}
              leadingIcon={<Icon name="check" size={20} />}
            >
              {t('medications.markTaken')}
            </Button>
          )}
          {onDelete && (
            <IconButton
              label={t('medications.deleteLabel')}
              icon="trash"
              iconSize={20}
              className="text-content-variant hover:text-sos"
              onClick={() => onDelete(dose)}
              disabled={busy}
            />
          )}
        </div>
      </div>
    </div>
  )
}
