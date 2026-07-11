import { useTranslation } from 'react-i18next'
import { Card, Chip, Icon, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate } from '@/lib/datetime'
import { formatCurrency } from '@/lib/money'
import type { CostCategory, CostEntryRow, CostShareRow } from '../types'

const CATEGORY_TONE: Record<CostCategory, 'teal' | 'sage' | 'sand' | 'neutral'> = {
  medication: 'teal',
  diaper: 'sand',
  caregiver: 'sage',
  other: 'neutral',
}

interface CostEntryCardProps {
  entry: CostEntryRow
  shares: CostShareRow[]
  onDelete?: (entry: CostEntryRow) => void
}

export function CostEntryCard({ entry, shares, onDelete }: CostEntryCardProps) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const { isOpen: expanded, toggle } = useDisclosure()

  return (
    <Card>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={t(expanded ? 'costs.collapseLabel' : 'costs.expandLabel')}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn('text-base font-bold text-content', !expanded && 'truncate')}>
                {entry.description}
              </p>
              <Chip tone={CATEGORY_TONE[entry.category]} className="ml-auto shrink-0">
                {t(`costs.category.${entry.category}`)}
              </Chip>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-sm text-content-variant">
                {t('costs.paidBy', { name: entry.paid_by_name ?? '' })} ·{' '}
                {formatDate(entry.expense_date, current)}
              </p>
              <p className="shrink-0 text-base font-bold text-content">
                {formatCurrency(entry.amount_cents, current, entry.currency)}
              </p>
            </div>
            {expanded && (
              <ul className="mt-3 flex flex-col gap-1 border-t border-outline-variant pt-3">
                {shares.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-content-variant">{s.user_name ?? s.user_id}</span>
                    <span className="font-semibold text-content">
                      {formatCurrency(s.share_cents, current, entry.currency)}
                    </span>
                  </li>
                ))}
                {entry.notes && <li className="pt-1 text-sm text-content-variant">{entry.notes}</li>}
              </ul>
            )}
          </div>
          <Icon
            name="chevronRight"
            size={20}
            className={cn(
              'mt-0.5 shrink-0 text-content-variant transition-transform',
              expanded ? '-rotate-90' : 'rotate-90',
            )}
          />
        </button>
        {onDelete && (
          <IconButton
            label={t('costs.deleteLabel')}
            icon="trash"
            iconSize={20}
            className="shrink-0 text-content-variant hover:text-sos"
            onClick={() => onDelete(entry)}
          />
        )}
      </div>
    </Card>
  )
}
