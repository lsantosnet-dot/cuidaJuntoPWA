import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, Avatar, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useLanguage } from '@/hooks/useLanguage'
import { formatTime } from '@/lib/datetime'
import { useShifts } from './useShifts'
import { ShiftCard } from './components/ShiftCard'
import { AddShiftForm } from './components/AddShiftForm'
import type { ShiftRow } from './types'

/** "2h 35min" / "35min" elapsed since `startsAt`, recomputed every minute. */
function useElapsed(startsAt: string | undefined): string | null {
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (!startsAt) return
    const id = window.setInterval(() => forceTick((n) => n + 1), 60_000)
    return () => window.clearInterval(id)
  }, [startsAt])

  return useMemo(() => {
    if (!startsAt) return null
    const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(startsAt).getTime()) / 60_000))
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return h > 0 ? `${h}h ${m}min` : `${m}min`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startsAt, forceTick])
}

/** Highlighted sticky card showing who is currently on duty, elapsed time, and the assume action. */
function CurrentShift({
  shift,
  nextShift,
  onAssume,
  busy,
}: {
  shift: ShiftRow | null
  nextShift: ShiftRow | null
  onAssume: () => void
  busy: boolean
}) {
  const { t } = useTranslation()
  const { current } = useLanguage()
  const elapsed = useElapsed(shift?.starts_at)

  return (
    <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-10 mb-5 rounded-card bg-primary p-4 text-primary-on shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-on/80">
        {t('shifts.onDuty')}
      </p>
      {shift ? (
        <>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={shift.caregiver_name ?? '?'} size={44} className="ring-2 ring-primary-on/40" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold">{shift.caregiver_name}</p>
              {elapsed && (
                <p className="text-sm text-primary-on/80">{t('shifts.elapsedSince', { duration: elapsed })}</p>
              )}
            </div>
            <Button
              variant="ghost"
              className="bg-primary-on/15 text-primary-on hover:bg-primary-on/25"
              onClick={onAssume}
              disabled={busy}
            >
              {t('shifts.takeOver')}
            </Button>
          </div>
          {nextShift && (
            <p className="mt-3 border-t border-primary-on/20 pt-2 text-sm text-primary-on/80">
              {t('shifts.nextHandoff', {
                name: nextShift.caregiver_name,
                time: formatTime(nextShift.starts_at, current),
              })}
            </p>
          )}
        </>
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

/** Past shifts rendered as a connected vertical timeline instead of plain cards. */
function ShiftTimeline({
  shifts,
  busy,
  onDelete,
}: {
  shifts: ShiftRow[]
  busy: boolean
  onDelete: (shift: ShiftRow) => void
}) {
  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-outline-variant pl-5">
      {shifts.map((shift) => (
        <li key={shift.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[1.6rem] top-5 h-2.5 w-2.5 rounded-pill bg-outline-variant"
          />
          <ShiftCard shift={shift} busy={busy} onEnd={() => {}} onDelete={onDelete} />
        </li>
      ))}
    </ol>
  )
}

export function ShiftsView() {
  const { t } = useTranslation()
  const { shifts, activeShift, isLoading, error, assume, end, add, remove } = useShifts()
  const form = useDisclosure()
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ShiftRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

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

  const upcoming = [...shifts]
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const history = shifts.filter((s) => s.status === 'ended')
  const nextShift = upcoming[0] ?? null

  return (
    <div>
      <PageHeader title={t('pages.schedule.title')} subtitle={t('pages.schedule.subtitle')} />

      <CurrentShift
        shift={activeShift}
        nextShift={nextShift}
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
        <div className="flex flex-col gap-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
                {t('shifts.sectionUpcoming')} · {upcoming.length}
              </h2>
              <ul className="flex flex-col gap-3">
                {upcoming.map((shift) => (
                  <li key={shift.id}>
                    <ShiftCard
                      shift={shift}
                      busy={busy}
                      onEnd={(id) => void withBusy(() => end(id))}
                      onDelete={setPendingDelete}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
                {t('shifts.sectionHistory')} · {history.length}
              </h2>
              <ShiftTimeline shifts={history} busy={busy} onDelete={setPendingDelete} />
            </section>
          )}
        </div>
      )}

      <AddShiftForm isOpen={form.isOpen} onClose={form.close} onSubmit={add} />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('shifts.deleteTitle')}
        description={t('shifts.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
