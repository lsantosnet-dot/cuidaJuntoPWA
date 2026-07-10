import { useTranslation } from 'react-i18next'
import { PageHeader, EmptyState, type IconName } from '@/components/ui'

interface ModulePlaceholderProps {
  /** i18n key prefix under `pages`, e.g. "home" -> pages.home.title/subtitle. */
  page: string
  icon: IconName
}

/**
 * Phase 1 scaffold: renders a page's header plus a friendly "coming soon"
 * state. Each module replaces this with its real UI in later phases.
 */
export function ModulePlaceholder({ page, icon }: ModulePlaceholderProps) {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t(`pages.${page}.title`)} subtitle={t(`pages.${page}.subtitle`)} />
      <EmptyState
        icon={icon}
        title={t('common.comingSoon')}
        description={t('common.underConstruction')}
      />
    </div>
  )
}
