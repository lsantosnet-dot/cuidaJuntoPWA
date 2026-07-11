import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, TextArea, IconButton, Icon } from '@/components/ui'
import type { NewMedication } from '../types'

interface AddMedicationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewMedication) => Promise<void>
}

export function AddMedicationForm({ isOpen, onClose, onSubmit }: AddMedicationFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState<string[]>([''])
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setDosage('')
    setTimes([''])
    setInstructions('')
  }

  const updateTime = (index: number, value: string) => {
    setTimes(times.map((t, i) => (i === index ? value : t)))
  }

  const addTime = () => setTimes([...times, ''])

  const removeTime = (index: number) => {
    const next = times.filter((_, i) => i !== index)
    setTimes(next.length > 0 ? next : [''])
  }

  const parsedTimes = times.map((t) => t.trim()).filter((t) => /^\d{2}:\d{2}$/.test(t))
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
        <FormField label={t('medications.fieldTimes')}>
          {(id) => (
            <div className="flex flex-col gap-2">
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextField
                    id={index === 0 ? id : undefined}
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    required
                    className="flex-1"
                  />
                  {times.length > 1 && (
                    <IconButton
                      label={t('medications.removeTime')}
                      icon="close"
                      onClick={() => removeTime(index)}
                    />
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addTime} leadingIcon={<Icon name="plus" size={20} />}>
                {t('medications.addTime')}
              </Button>
            </div>
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
