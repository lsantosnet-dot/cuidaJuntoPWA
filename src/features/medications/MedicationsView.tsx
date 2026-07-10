import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Button, Icon, EmptyState, Spinner } from '@/components/ui'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useMedications } from './useMedications'
import { DoseCard } from './components/DoseCard'
import { AddMedicationForm } from './components/AddMedicationForm'
import type { Dose } from './types'

export function MedicationsView() {
  const { t } = useTranslation()
  const { doses, isLoading, error, markTaken, undo, addMedication } = useMedications()
  const form = useDisclosure()
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const runOn = async (dose: Dose, fn: (d: Dose) => Promise<void>) => {
    setBusyKey(dose.key)
    try {
      await fn(dose)
    } finally {
      setBusyKey(null)
    }
  }

  const pending = doses.filter((d) => d.status === 'pending')

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
        <ul className="flex flex-col gap-3">
          {doses.map((dose) => (
            <li key={dose.key}>
              <DoseCard
                dose={dose}
                busy={busyKey === dose.key}
                onMarkTaken={(d) => runOn(d, markTaken)}
                onUndo={(d) => runOn(d, undo)}
              />
            </li>
          ))}
        </ul>
      )}

      <AddMedicationForm isOpen={form.isOpen} onClose={form.close} onSubmit={addMedication} />
    </div>
  )
}
