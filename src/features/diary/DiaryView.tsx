import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDiary } from './useDiary'
import { DiaryCard } from './components/DiaryCard'
import { AddDiaryForm } from './components/AddDiaryForm'
import type { DiaryEntryRow } from './types'

export function DiaryView() {
  const { t } = useTranslation()
  const { entries, isLoading, error, add, remove } = useDiary()
  const form = useDisclosure()
  const [pendingDelete, setPendingDelete] = useState<DiaryEntryRow | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      <PageHeader title={t('pages.diary.title')} subtitle={t('pages.diary.subtitle')} />

      <div className="mb-4 flex justify-end">
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('diary.add')}
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
          icon="book"
          title={t('diary.emptyTitle')}
          description={t('diary.emptyDescription')}
          action={
            <Button onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
              {t('diary.add')}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <DiaryCard entry={entry} onDelete={setPendingDelete} />
            </li>
          ))}
        </ul>
      )}

      <AddDiaryForm isOpen={form.isOpen} onClose={form.close} onSubmit={add} />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('diary.deleteTitle')}
        description={t('diary.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
