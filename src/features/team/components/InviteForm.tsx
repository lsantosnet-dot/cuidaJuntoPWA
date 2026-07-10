import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, Select } from '@/components/ui'
import { ROLE_OPTIONS, type NewInvite, type MembershipRole } from '../types'

interface InviteFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewInvite) => Promise<void>
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function InviteForm({ isOpen, onClose, onSubmit }: InviteFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MembershipRole>('caregiver')
  const [saving, setSaving] = useState(false)

  const canSave = emailOk(email) && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSubmit({ email: email.trim(), role })
      setEmail('')
      setRole('caregiver')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('team.inviteTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('team.fieldEmail')} hint={t('team.inviteHint')}>
          {(id) => (
            <TextField
              id={id}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              autoFocus
              required
            />
          )}
        </FormField>
        <FormField label={t('team.fieldRole')}>
          {(id) => (
            <Select
              id={id}
              value={role}
              onChange={(e) => setRole(e.target.value as MembershipRole)}
              options={ROLE_OPTIONS.map((r) => ({ value: r, label: t(`team.role.${r}`) }))}
            />
          )}
        </FormField>
        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth disabled={!canSave}>
            {t('team.sendInvite')}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
