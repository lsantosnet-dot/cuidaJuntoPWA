import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useShifts } from '@/features/shifts'
import { useMedications } from './useMedications'
import { DoseCard } from './components/DoseCard'
import { AddMedicationForm } from './components/AddMedicationForm'
import type { Dose } from './types'

/** Groups today's doses into due-now / upcoming / completed for a timeline-style read. */
function groupDoses(doses: Dose[]) {
  const now = Date.now()
  const due: Dose[] = []
  const upcoming: Dose[] = []
  const completed: Dose[] = []
  for (const dose of doses) {
    if (dose.status === 'taken') completed.push(dose)
    else if (new Date(dose.scheduledFor).getTime() <= now) due.push(dose)
    else upcoming.push(dose)
  }
  return { due, upcoming, completed }
}

export function MedicationsView() {
  const { t } = useTranslation()
  const { doses, isLoading, error, markTaken, undo, addMedication, removeMedication } =
    useMedications()
  const { activeShift } = useShifts()
  const form = useDisclosure()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Dose | null>(null)
  const [deleting, setDeleting] = useState(false)

  const runOn = async (dose: Dose, fn: (d: Dose) => Promise<void>) => {
    setBusyKey(dose.key)
    try {
      await fn(dose)
    } finally {
      setBusyKey(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await removeMedication(pendingDelete.medicationId)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const pending = doses.filter((d) => d.status === 'pending')
  const { due, upcoming, completed } = groupDoses(doses)
  const caregiverName = activeShift?.caregiver_name ?? null

  const renderGroup = (label: string, group: Dose[], isUpcoming = false) =>
    group.length > 0 && (
      <section key={label}>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
          {label} · {group.length}
        </h2>
        <ul className="flex flex-col gap-3">
          {group.map((dose) => (
            <li key={dose.key}>
              <DoseCard
                dose={dose}
                busy={busyKey === dose.key}
                onMarkTaken={(d) => runOn(d, markTaken)}
                onUndo={(d) => runOn(d, undo)}
                onDelete={setPendingDelete}
                caregiverName={dose.status === 'pending' ? caregiverName : undefined}
                isUpcoming={isUpcoming}
              />
            </li>
          ))}
        </ul>
      </section>
    )

  return (
    <div>
      <PageHeader title={t('pages.medications.title')} subtitle={t('pages.medications.subtitle')} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-content-variant">
          {t('medications.remaining', { count: pending.length })}
        </p>
        <Button size="md" onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
          {t('medications.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label={t('common.loading')} />
        </div>
      ) : error ? (
        <EmptyState icon="alert" title={t('common.error')} description={error} />
      ) : doses.length === 0 ? (
        <EmptyState
          icon="pill"
          title={t('medications.emptyTitle')}
          description={t('medications.emptyDescription')}
          action={
            <Button onClick={form.open} leadingIcon={<Icon name="plus" size={20} />}>
              {t('medications.add')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {renderGroup(t('medications.sectionDue'), due)}
          {renderGroup(t('medications.sectionUpcoming'), upcoming, true)}
          {renderGroup(t('medications.sectionCompleted'), completed)}
        </div>
      )}

      <AddMedicationForm isOpen={form.isOpen} onClose={form.close} onSubmit={addMedication} />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
        title={t('medications.deleteTitle')}
        description={t('medications.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  )
}
