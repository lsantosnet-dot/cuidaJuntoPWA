import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, TextArea } from '@/components/ui'
import type { NewMedication } from '../types'

interface AddMedicationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewMedication) => Promise<void>
}

function parseTimes(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => /^\d{1,2}:\d{2}$/.test(t))
    .map((t) => t.padStart(5, '0'))
}

export function AddMedicationForm({ isOpen, onClose, onSubmit }: AddMedicationFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState('')
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setDosage('')
    setTimes('')
    setInstructions('')
  }

  const parsedTimes = parseTimes(times)
  const canSave = name.trim().length > 0 && parsedTimes.length > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), dosage: dosage.trim(), times: parsedTimes, instructions: instructions.trim() })
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('medications.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('medications.fieldName')}>
          {(id) => (
            <TextField id={id} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          )}
        </FormField>
        <FormField label={t('medications.fieldDosage')}>
          {(id) => (
            <TextField
              id={id}
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder={t('medications.dosagePlaceholder')}
            />
          )}
        </FormField>
        <FormField label={t('medications.fieldTimes')} hint={t('medications.timesHint')}>
          {(id) => (
            <TextField
              id={id}
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              placeholder="08:00, 20:00"
              inputMode="numeric"
              required
            />
          )}
        </FormField>
        <FormField label={t('medications.fieldInstructions')}>
          {(id) => (
            <TextArea id={id} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
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
