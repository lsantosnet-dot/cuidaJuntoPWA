import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Segmented PT/EN switch, shown in the side drawer. */
export function LanguageToggle() {
  const { t } = useTranslation()
  const { current, setLanguage, languages } = useLanguage()

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-content-variant">
        <Icon name="globe" size={18} />
        {t('drawer.language')}
      </p>
      <div
        role="group"
        aria-label={t('drawer.language')}
        className="flex gap-1 rounded-pill bg-surface-container p-1"
      >
        {languages.map((lang) => {
          const active = current === lang
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              aria-pressed={active}
              className={cn(
                'min-h-touch flex-1 rounded-pill px-4 text-base font-semibold transition-colors',
                active
                  ? 'bg-primary text-primary-on'
                  : 'text-content-variant hover:bg-surface-container-high',
              )}
            >
              {t(`language.${lang}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
