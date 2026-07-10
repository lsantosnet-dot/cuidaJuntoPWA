import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Card } from '@/components/ui'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { CircleSwitcher } from '@/features/care-circle'
import { NotificationsCard } from '@/features/notifications'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-variant">
        {title}
      </h2>
      <Card>{children}</Card>
    </section>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t('pages.settings.title')} subtitle={t('pages.settings.subtitle')} />

      <Section title={t('circles.section')}>
        <CircleSwitcher />
      </Section>

      <Section title={t('notifications.section')}>
        <NotificationsCard />
      </Section>

      <Section title={t('drawer.language')}>
        <LanguageToggle />
      </Section>
    </div>
  )
}
