import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIMARY_NAV } from '@/config/navigation'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Bottom navigation bar with the 4 primary destinations. */
export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('drawer.title')}
      className="safe-bottom sticky bottom-0 z-30 border-t border-outline-variant bg-surface-low"
    >
      <ul className="mx-auto flex max-w-app">
        {PRIMARY_NAV.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch flex-col items-center justify-center gap-0.5 py-2',
                  isActive ? 'text-primary' : 'text-content-variant',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={24} />
                  <span className="text-xs font-semibold">{t(item.labelKey)}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 h-1 w-1 rounded-pill',
                      isActive ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
