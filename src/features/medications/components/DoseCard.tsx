import { useTranslation } from 'react-i18next'
import { Button, Icon, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatTime } from '@/lib/datetime'
import type { Dose } from '../types'

interface DoseCardProps {
  dose: Dose
  onMarkTaken: (dose: Dose) => void
  onUndo: (dose: Dose) => void
  /** Omit to hide the delete action (e.g. dashboard preview tiles). */
  onDelete?: (dose: Dose) => void
  busy?: boolean
  /** Name of the caregiver currently on duty, shown as the responsible party for doses not yet taken. */
  caregiverName?: string | null
  /** Whether the scheduled time is still ahead of now (vs. already due). Only meaningful when pending. */
  isUpcoming?: boolean
}

/** Medication dose card with a left status strip (green taken / amber due / teal upcoming). */
export function DoseCard({
  dose,
  onMarkTaken,
  onUndo,
  onDelete,
  busy,
  caregiverName,
  isUpcoming,
}: DoseCardProps) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { isOpen: expanded, toggle } = useDisclosure()
  const taken = dose.status === 'taken'

  return (
    <div className="flex overflow-hidden rounded-card bg-surface-lowest shadow-card dark:ring-1 dark:ring-white/10">
      <span
        className={cn('w-1.5 shrink-0', taken ? 'bg-secondary' : isUpcoming ? 'bg-primary' : 'bg-tertiary')}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={t(expanded ? 'medications.collapseLabel' : 'medications.expandLabel')}
        className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left"
      >
        <span className="text-lg font-bold text-content">{dose.time}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-base font-bold text-content', !expanded && 'truncate')}>
            {dose.name}
            {dose.dosage && <span className="font-normal text-content-variant"> · {dose.dosage}</span>}
          </p>
          {taken ? (
            <p className={cn('text-sm text-secondary', !expanded && 'truncate')}>
              {t('medications.takenBy', {
                name: dose.takenByName ?? '',
                time: dose.takenAt ? formatTime(dose.takenAt, current) : '',
              })}
            </p>
          ) : (
            <>
              {dose.instructions && (
                <p className={cn('text-sm text-content-variant', !expanded && 'truncate')}>
                  {dose.instructions}
                </p>
              )}
              {caregiverName && (
                <p className={cn('text-sm text-content-variant', !expanded && 'truncate')}>
                  {t('medications.responsibleCaregiver', { name: caregiverName })}
                </p>
              )}
            </>
          )}
        </div>
        <Icon
          name="chevronRight"
          size={20}
          className={cn(
            'shrink-0 text-content-variant transition-transform',
            expanded ? '-rotate-90' : 'rotate-90',
          )}
        />
      </button>
      <div className="flex shrink-0 items-center gap-1 py-4 pr-4">
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
  )
}
