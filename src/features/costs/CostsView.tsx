import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, ConfirmDialog, Card } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useLanguage } from '@/hooks/useLanguage'
import { formatCurrency } from '@/lib/money'
import { useCosts } from './useCosts'
import { BalanceSummary } from './components/BalanceSummary'
import { CostEntryCard } from './components/CostEntryCard'
import { AddCostForm } from './components/AddCostForm'
import { SettleUpModal } from './components/SettleUpModal'
import type { SimplifiedDebt } from './balances'
import type { CostEntryRow } from './types'

export function CostsView() {
  const { t } = useTranslation()
  const {
    entries,
    shares,
    members,
    isLoading,
    error,
    balances,
    simplifiedDebts,
    add,
    remove,
    settle,
    currentUserId,
  } = useCosts()
  const { current } = useLanguage()
  const form = useDisclosure()
  const [pendingDelete, setPendingDelete] = useState<CostEntryRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pendingSettle, setPendingSettle] = useState<SimplifiedDebt | null>(null)

  const now = new Date()
  const monthTotalCents = entries
    .filter((e) => {
      const d = new Date(e.expense_date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, e) => sum + e.amount_cents, 0)
  const pendingReimbursementCents = simplifiedDebts.reduce((sum, d) => sum + d.amountCents, 0)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await remove(pendingDelete.id)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('pages.costs.title')} subtitle={t('pages.costs.subtitle')} />

      <div className="mb-4 flex justify-end">
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('costs.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('costs.emptyTitle')}
          description={t('costs.emptyDescription')}
          action={
            <Button onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
              {t('costs.add')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <Card elevated={false}>
              <p className="text-sm font-semibold text-content-variant">{t('costs.monthTotal')}</p>
              <p className="mt-1 text-lg font-bold text-content">
                {formatCurrency(monthTotalCents, current)}
              </p>
            </Card>
            <Card elevated={false}>
              <p className="text-sm font-semibold text-content-variant">{t('costs.pendingReimbursement')}</p>
              <p className="mt-1 text-lg font-bold text-tertiary">
                {formatCurrency(pendingReimbursementCents, current)}
              </p>
            </Card>
          </div>

          <BalanceSummary
            balances={balances}
            simplifiedDebts={simplifiedDebts}
            currentUserId={currentUserId}
            onSettle={setPendingSettle}
          />

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
              {t('costs.historySection')}
            </h2>
            <ul className="flex flex-col gap-3">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <CostEntryCard
                    entry={entry}
                    shares={shares.filter((s) => s.cost_entry_id === entry.id)}
                    onDelete={setPendingDelete}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <AddCostForm
        isOpen={form.isOpen}
        onClose={form.close}
        onSubmit={add}
        members={members}
        currentUserId={currentUserId}
      />

      <SettleUpModal debt={pendingSettle} onClose={() => setPendingSettle(null)} onConfirm={settle} />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('costs.deleteTitle')}
        description={t('costs.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
