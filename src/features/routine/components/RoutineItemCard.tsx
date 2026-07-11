import { useTranslation } from 'react-i18next'
import { Button, Icon, IconButton, type IconName } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { RoutineProgress, RoutineType } from '../types'

interface RoutineItemCardProps {
  progress: RoutineProgress
  onMarkDone: (progress: RoutineProgress) => void
  onUndo: (progress: RoutineProgress) => void
  /** Omit to hide the delete action (e.g. dashboard preview tiles). */
  onDelete?: (progress: RoutineProgress) => void
  busy?: boolean
}

const TYPE_ICON: Record<RoutineType, IconName> = {
  bath: 'bath',
  meal: 'meal',
  hydration: 'droplet',
  other: 'checklist',
}

/** Above this daily target, individual boxes give way to a compact counter
 * so the card doesn't fill up with taps for high-frequency items. */
const DOTS_MAX_TARGET = 4

export function RoutineItemCard({ progress, onMarkDone, onUndo, onDelete, busy }: RoutineItemCardProps) {
  const { t } = useTranslation()
  const { item, doneCount, target } = progress
  const complete = doneCount >= target

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface-lowest p-4 shadow-card dark:ring-1 dark:ring-white/10">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-primary/10 text-primary">
          <Icon name={TYPE_ICON[item.type]} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-content">{item.name}</p>
          <p className="text-sm text-content-variant">{t('routine.target', { count: target })}</p>
        </div>
        {onDelete && (
          <IconButton
            label={t('routine.deleteLabel')}
            icon="trash"
            iconSize={18}
            className="text-content-variant hover:text-sos"
            onClick={() => onDelete(progress)}
            disabled={busy}
          />
        )}
      </div>

      {target === 1 ? (
        complete ? (
          <Button variant="outline" size="md" onClick={() => onUndo(progress)} disabled={busy}>
            {t('routine.undo')}
          </Button>
        ) : (
          <Button
            size="md"
            onClick={() => onMarkDone(progress)}
            disabled={busy}
            leadingIcon={<Icon name="check" size={20} />}
          >
            {t('routine.markDone')}
          </Button>
        )
      ) : target <= DOTS_MAX_TARGET ? (
        <div className="flex gap-2">
          {Array.from({ length: target }, (_, i) => {
            const filled = i < doneCount
            const clickable = filled || i === doneCount
            return (
              <button
                key={i}
                type="button"
                disabled={busy || !clickable}
                onClick={() => (filled ? onUndo(progress) : onMarkDone(progress))}
                aria-label={filled ? t('routine.undo') : t('routine.markDone')}
                className={cn(
                  'flex h-9 flex-1 items-center justify-center rounded-input border-2 transition-colors disabled:opacity-40',
                  filled
                    ? 'border-secondary bg-secondary-container text-secondary-on-container'
                    : 'border-outline-variant bg-transparent text-content-variant',
                )}
              >
                <Icon name={filled ? 'check' : 'circle'} size={18} />
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <IconButton
            label={t('routine.decrement')}
            icon="minus"
            onClick={() => onUndo(progress)}
            disabled={busy || doneCount === 0}
            className="border border-outline-variant"
          />
          <p className="flex-1 text-center text-sm font-semibold text-content-variant">
            {t('routine.progress', { done: doneCount, target })}
          </p>
          <IconButton
            label={t('routine.increment')}
            icon="plus"
            onClick={() => onMarkDone(progress)}
            disabled={busy || complete}
            className="border border-outline-variant"
          />
        </div>
      )}
    </div>
  )
}
