import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField } from '@/components/ui'
import type { NewShift } from '../types'

interface AddShiftFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewShift) => Promise<void>
}

const toISO = (localValue: string): string | null =>
  localValue ? new Date(localValue).toISOString() : null

export function AddShiftForm({ isOpen, onClose, onSubmit }: AddShiftFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && start !== '' && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({
        caregiverName: name.trim(),
        startsAt: toISO(start) as string,
        endsAt: toISO(end),
      })
      setName('')
      setStart('')
      setEnd('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shifts.addTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('shifts.fieldCaregiver')}>
          {(id) => (
            <TextField id={id} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          )}
        </FormField>
        <FormField label={t('shifts.fieldStart')}>
          {(id) => (
            <TextField
              id={id}
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          )}
        </FormField>
        <FormField label={`${t('shifts.fieldEnd')} (${t('common.optional')})`}>
          {(id) => (
            <TextField
              id={id}
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          )}
        </FormField>
        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave} loading={saving}>
            {t('common.save')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
