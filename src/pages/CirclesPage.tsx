import { useTranslation } from 'react-i18next'
import { PageHeader, Card } from '@/components/ui'
import { CircleSwitcher } from '@/features/care-circle'

export default function CirclesPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t('pages.circles.title')} subtitle={t('pages.circles.subtitle')} />
      <Card>
        <CircleSwitcher />
      </Card>
    </div>
  )
}
