import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { EmptyState, Button } from '@/components/ui'
import { ROUTES } from '@/lib/routes'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="pt-6">
      <EmptyState
        icon="alert"
        title={t('pages.notFound.title')}
        description={t('pages.notFound.subtitle')}
        action={
          <Link to={ROUTES.home}>
            <Button>{t('pages.notFound.back')}</Button>
          </Link>
        }
      />
    </div>
  )
}
