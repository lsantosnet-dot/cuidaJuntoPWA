import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
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
  const form = useDisclosure()
  const [pendingDelete, setPendingDelete] = useState<CostEntryRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pendingSettle, setPendingSettle] = useState<SimplifiedDebt | null>(null)

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
