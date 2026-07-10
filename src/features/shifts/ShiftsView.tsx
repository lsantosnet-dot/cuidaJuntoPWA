import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, Avatar } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useShifts } from './useShifts'
import { ShiftCard } from './components/ShiftCard'
import { AddShiftForm } from './components/AddShiftForm'

/** Highlighted card showing who is currently on duty, with the assume action. */
function CurrentShift({
  name,
  onAssume,
  busy,
}: {
  name: string | null
  onAssume: () => void
  busy: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="mb-5 rounded-card bg-primary p-4 text-primary-on shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-on/80">
        {t('shifts.onDuty')}
      </p>
      {name ? (
        <div className="mt-2 flex items-center gap-3">
          <Avatar name={name} size={44} className="ring-2 ring-primary-on/40" />
          <p className="flex-1 text-lg font-bold">{name}</p>
          <Button
            variant="ghost"
            className="bg-primary-on/15 text-primary-on hover:bg-primary-on/25"
            onClick={onAssume}
            disabled={busy}
          >
            {t('shifts.takeOver')}
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-lg font-bold">{t('shifts.nobody')}</p>
          <Button
            variant="ghost"
            className="bg-primary-on/15 text-primary-on hover:bg-primary-on/25"
            onClick={onAssume}
            disabled={busy}
          >
            {t('shifts.assume')}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ShiftsView() {
  const { t } = useTranslation()
  const { shifts, activeShift, isLoading, error, assume, end, add } = useShifts()
  const form = useDisclosure()
  const [busy, setBusy] = useState(false)

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('pages.schedule.title')} subtitle={t('pages.schedule.subtitle')} />

      <CurrentShift
        name={activeShift?.caregiver_name ?? null}
        onAssume={() => void withBusy(assume)}
        busy={busy}
      />

      <div className="mb-4 flex justify-end">
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('shifts.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : shifts.length === 0 ? (
        <EmptyState icon="calendar" title={t('shifts.emptyTitle')} description={t('shifts.emptyDescription')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {shifts.map((shift) => (
            <li key={shift.id}>
              <ShiftCard shift={shift} busy={busy} onEnd={(id) => void withBusy(() => end(id))} />
            </li>
          ))}
        </ul>
      )}

      <AddShiftForm isOpen={form.isOpen} onClose={form.close} onSubmit={add} />
    </div>
  )
}
