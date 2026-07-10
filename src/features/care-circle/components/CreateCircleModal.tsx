import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField } from '@/components/ui'
import { useCareCircle } from '../CareCircleContext'

interface CreateCircleModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Creates an additional care circle (beyond first-run onboarding). */
export function CreateCircleModal({ isOpen, onClose }: CreateCircleModalProps) {
  const { t } = useTranslation()
  const { createCircle } = useCareCircle()
  const [recipient, setRecipient] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = recipient.trim().length > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await createCircle({
        name: t('onboarding.circleName', { name: recipient.trim() }),
        recipientName: recipient.trim(),
      })
      setRecipient('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('circles.createTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('onboarding.recipientLabel')} hint={t('onboarding.recipientHint')}>
          {(id) => (
            <TextField
              id={id}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={t('onboarding.recipientPlaceholder')}
              autoFocus
              required
            />
          )}
        </FormField>
        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave}>
            {t('onboarding.create')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
