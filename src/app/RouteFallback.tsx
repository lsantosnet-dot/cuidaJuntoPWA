import { useTranslation } from 'react-i18next'

/** Lightweight loading state shown while a lazy page chunk loads. */
export function RouteFallback() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-16 text-content-variant" role="status">
      {t('common.loading')}
    </div>
  )
}
