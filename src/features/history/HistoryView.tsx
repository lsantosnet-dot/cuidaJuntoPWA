import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useHistory } from './useHistory'
import { RecordCard } from './components/RecordCard'
import { AddRecordForm } from './components/AddRecordForm'

export function HistoryView() {
  const { t } = useTranslation()
  const { records, isLoading, error, add } = useHistory()
  const form = useDisclosure()

  return (
    <div>
      <PageHeader title={t('pages.history.title')} subtitle={t('pages.history.subtitle')} />

      <div className="mb-4 flex justify-end">
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('history.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : records.length === 0 ? (
        <EmptyState
          icon="history"
          title={t('history.emptyTitle')}
          description={t('history.emptyDescription')}
          action={
            <Button onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
              {t('history.add')}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {records.map((r) => (
            <li key={r.id}>
              <RecordCard record={r} />
            </li>
          ))}
        </ul>
      )}

      <AddRecordForm isOpen={form.isOpen} onClose={form.close} onSubmit={add} />
    </div>
  )
}
