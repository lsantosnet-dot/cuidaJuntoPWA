import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, FormField, TextField, Spinner } from '@/components/ui'
import { UserMenu } from '@/features/auth'
import { useCareCircle } from './CareCircleContext'

/**
 * First-run screen shown when the signed-in user has no care circle yet.
 * Creates the circle + their admin membership + the care recipient in one step.
 */
export function CreateCircleScreen() {
  const { t } = useTranslation()
  const { createCircle } = useCareCircle()
  const [recipient, setRecipient] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = recipient.trim().length > 0 && !saving

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const name = t('onboarding.circleName', { name: recipient.trim() })
      await createCircle({ name, recipientName: recipient.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar círculo')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{t('onboarding.title')}</h1>
        <p className="mt-2 text-base text-content-variant">{t('onboarding.subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
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

        {error && <p className="text-base text-danger">{error}</p>}

        <Button type="submit" size="lg" fullWidth disabled={!canSave}>
          {saving ? <Spinner size={22} className="border-primary-on/40 border-t-primary-on" /> : t('onboarding.create')}
        </Button>
      </form>

      <footer className="mt-8 border-t border-outline-variant pt-4">
        <UserMenu />
      </footer>
    </div>
  )
}
