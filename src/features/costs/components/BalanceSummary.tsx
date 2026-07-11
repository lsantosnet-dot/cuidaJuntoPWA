import { useTranslation } from 'react-i18next'
import { Card, Button, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { formatCurrency } from '@/lib/money'
import type { MemberBalance, SimplifiedDebt } from '../balances'

interface BalanceSummaryProps {
  balances: MemberBalance[]
  simplifiedDebts: SimplifiedDebt[]
  currentUserId: string
  onSettle: (debt: SimplifiedDebt) => void
}

export function BalanceSummary({ balances, simplifiedDebts, currentUserId, onSettle }: BalanceSummaryProps) {
  const { t } = useTranslation()
  const { current } = useLanguage()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {balances.map((b) => (
          <Card key={b.userId} elevated={false} className={cn(b.userId === currentUserId && 'border-primary')}>
            <p className="truncate text-sm font-semibold text-content-variant">{b.userName}</p>
            <p
              className={cn(
                'mt-1 text-lg font-bold',
                b.balanceCents > 0 && 'text-secondary',
                b.balanceCents < 0 && 'text-sos',
                b.balanceCents === 0 && 'text-content',
              )}
            >
              {b.balanceCents >= 0 ? '+' : ''}
              {formatCurrency(b.balanceCents, current)}
            </p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
          {t('costs.whoOwesWhom')}
        </h2>
        {simplifiedDebts.length === 0 ? (
          <EmptyState icon="check" title={t('costs.allSettled')} />
        ) : (
          <ul className="flex flex-col gap-2">
            {simplifiedDebts.map((debt) => (
              <li key={`${debt.fromUserId}-${debt.toUserId}`}>
                <Card elevated={false} className="flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 text-base text-content">
                    {t('costs.debtLine', {
                      from: debt.fromUserName,
                      to: debt.toUserName,
                      amount: formatCurrency(debt.amountCents, current),
                    })}
                  </p>
                  <Button variant="outline" size="md" onClick={() => onSettle(debt)}>
                    {t('costs.markPaid')}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
