import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import { Icon } from '@/components/ui'

/**
 * Thin notice shown only in demo mode (Clerk not configured), so testers know
 * data is not being saved. Hidden entirely once auth is set up.
 */
export function DemoModeBanner() {
  const { t } = useTranslation()
  const { isDemo } = useAuth()

  if (!isDemo) return null

  return (
    <div className="flex items-center gap-2 bg-tertiary-container px-5 py-2 text-sm text-tertiary-on-container">
      <Icon name="info" size={16} />
      <p>
        <span className="font-semibold">{t('demo.title')}</span> {t('demo.message')}
      </p>
    </div>
  )
}
