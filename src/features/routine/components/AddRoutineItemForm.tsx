import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, SegmentedControl, IconButton } from '@/components/ui'
import type { NewRoutineItem, RoutineType } from '../types'

interface AddRoutineItemFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewRoutineItem) => Promise<void>
}

const TYPES: RoutineType[] = ['bath', 'meal', 'hydration', 'other']

export function AddRoutineItemForm({ isOpen, onClose, onSubmit }: AddRoutineItemFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState<RoutineType>('bath')
  const [target, setTarget] = useState(1)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setType('bath')
    setTarget(1)
  }

  const canSave = name.trim().length > 0 && target > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), type, targetCountPerDay: target })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('routine.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('routine.fieldName')}>
          {(id) => (
            <TextField id={id} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          )}
        </FormField>

        <FormField label={t('routine.fieldType')}>
          {() => (
            <SegmentedControl
              ariaLabel={t('routine.fieldType')}
              value={type}
              onChange={setType}
              segments={TYPES.map((tp) => ({ value: tp, label: t(`routine.type.${tp}`) }))}
            />
          )}
        </FormField>

        <FormField label={t('routine.fieldTarget')} hint={t('routine.targetHint')}>
          {() => (
            <div className="flex items-center gap-3">
              <IconButton
                label={t('routine.decrement')}
                icon="minus"
                onClick={() => setTarget((v) => Math.max(1, v - 1))}
                className="border border-outline-variant"
              />
              <span className="w-8 text-center text-lg font-bold text-content">{target}</span>
              <IconButton
                label={t('routine.increment')}
                icon="plus"
                onClick={() => setTarget((v) => v + 1)}
                className="border border-outline-variant"
              />
            </div>
          )}
        </FormField>

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave}>
            {t('common.save')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
