import { useTranslation } from 'react-i18next'
import { PageHeader, Card } from '@/components/ui'
import { LanguageToggle } from '@/components/layout/LanguageToggle'

export default function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t('pages.settings.title')} subtitle={t('pages.settings.subtitle')} />
      <Card>
        <LanguageToggle />
      </Card>
    </div>
  )
}
