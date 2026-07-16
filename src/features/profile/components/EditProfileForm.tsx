import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, TextArea } from '@/components/ui'
import type { CareRecipientRow, EditRecipient } from '../types'

interface EditProfileFormProps {
  isOpen: boolean
  onClose: () => void
  recipient: CareRecipientRow
  onSubmit: (input: EditRecipient) => Promise<void>
}

export function EditProfileForm({ isOpen, onClose, recipient, onSubmit }: EditProfileFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(recipient.name)
  const [conditions, setConditions] = useState(recipient.conditions.join(', '))
  const [birthDate, setBirthDate] = useState(recipient.birth_date ?? '')
  const [notes, setNotes] = useState(recipient.notes ?? '')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        conditions: conditions
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        birthDate: birthDate || null,
        notes: notes.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.editTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('profile.fieldName')}>
          {(id) => (
            <TextField id={id} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          )}
        </FormField>
        <FormField label={t('profile.fieldConditions')} hint={t('profile.conditionsHint')}>
          {(id) => (
            <TextField id={id} value={conditions} onChange={(e) => setConditions(e.target.value)} />
          )}
        </FormField>
        <FormField label={t('profile.fieldBirthDate')}>
          {(id) => (
            <TextField id={id} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          )}
        </FormField>
        <FormField label={t('profile.fieldNotes')}>
          {(id) => <TextArea id={id} value={notes} onChange={(e) => setNotes(e.target.value)} />}
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
