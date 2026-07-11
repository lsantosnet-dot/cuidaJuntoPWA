import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useRoutine } from './useRoutine'
import { RoutineItemCard } from './components/RoutineItemCard'
import { AddRoutineItemForm } from './components/AddRoutineItemForm'
import type { RoutineProgress } from './types'

export function RoutineView() {
  const { t } = useTranslation()
  const { progress, isLoading, error, markDone, undoLast, addItem, removeItem } = useRoutine()
  const form = useDisclosure()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<RoutineProgress | null>(null)
  const [deleting, setDeleting] = useState(false)

  const runOn = async (p: RoutineProgress, fn: (p: RoutineProgress) => Promise<void>) => {
    setBusyId(p.item.id)
    try {
      await fn(p)
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await removeItem(pendingDelete.item.id)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const done = progress.filter((p) => p.doneCount >= p.target).length

  return (
    <div>
      <PageHeader title={t('pages.routine.title')} subtitle={t('pages.routine.subtitle')} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-content-variant">
          {t('routine.todayProgress', { done, total: progress.length })}
        </p>
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('routine.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : progress.length === 0 ? (
        <EmptyState
          icon="checklist"
          title={t('routine.emptyTitle')}
          description={t('routine.emptyDescription')}
          action={
            <Button onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
              {t('routine.add')}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {progress.map((p) => (
            <li key={p.item.id}>
              <RoutineItemCard
                progress={p}
                busy={busyId === p.item.id}
                onMarkDone={(pr) => runOn(pr, markDone)}
                onUndo={(pr) => runOn(pr, undoLast)}
                onDelete={setPendingDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <AddRoutineItemForm isOpen={form.isOpen} onClose={form.close} onSubmit={addItem} />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('routine.deleteTitle')}
        description={t('routine.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
