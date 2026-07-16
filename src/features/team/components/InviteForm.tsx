import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Button, FormField, TextField, Select } from '@/components/ui'
import { joinPath } from '@/lib/routes'
import type { InviteRow } from '@/lib/database.types'
import { ROLE_OPTIONS, type MembershipRole } from '../types'

interface InviteFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: { email: string; role: MembershipRole }) => Promise<InviteRow>
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function inviteLink(token: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}#${joinPath(token)}`
}

export function InviteForm({ isOpen, onClose, onSubmit }: InviteFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MembershipRole>('caregiver')
  const [saving, setSaving] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const canSave = emailOk(email) && !saving

  const reset = () => {
    setEmail('')
    setRole('caregiver')
    setLink(null)
    setCopied(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const created = await onSubmit({ email: email.trim(), role })
      setLink(inviteLink(created.token))
    } finally {
      setSaving(false)
    }
  }

  const copy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title={t('team.inviteTitle')}>
      {link ? (
        <div className="flex flex-col gap-4">
          <p className="text-base text-content">{t('team.inviteLinkHint')}</p>
          <div className="break-all rounded-input border-[1.5px] border-outline-variant bg-surface-low p-3 text-sm text-content">
            {link}
          </div>
          <Button fullWidth onClick={copy}>
            {copied ? t('team.copied') : t('team.copyLink')}
          </Button>
          <Button variant="ghost" fullWidth onClick={close}>
            {t('common.done')}
          </Button>
        </div>
      ) : (
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
            <Button type="submit" fullWidth disabled={!canSave} loading={saving}>
              {t('team.sendInvite')}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={close} disabled={saving}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
