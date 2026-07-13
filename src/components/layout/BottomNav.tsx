import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIMARY_NAV } from '@/config/navigation'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Bottom navigation bar with the primary destinations. */
export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('drawer.title')}
      className="safe-bottom sticky bottom-0 z-30 border-t border-outline-variant bg-surface-low"
    >
      <ul className="mx-auto flex max-w-app gap-1 px-2 py-1.5">
        {PRIMARY_NAV.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch flex-col items-center justify-center gap-0.5 rounded-card py-1.5 transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-content-variant',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={isActive ? 26 : 24} className="transition-[width,height]" />
                  <span className={cn('text-xs', isActive ? 'font-bold' : 'font-semibold')}>
                    {t(item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
