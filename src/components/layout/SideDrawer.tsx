import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CARE_NAV, ACCOUNT_NAV, type NavItem } from '@/config/navigation'
import { Icon, IconButton } from '@/components/ui'
import { UserMenu } from '@/features/auth'
import { useCareCircle } from '@/features/care-circle'
import { LanguageToggle } from './LanguageToggle'
import { APP_VERSION } from '@/config/appInfo'
import { cn } from '@/lib/cn'

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function DrawerLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { t } = useTranslation()
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex min-h-touch items-center gap-3 rounded-card px-3 text-base font-semibold transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-content hover:bg-surface-container',
        )
      }
    >
      <Icon name={item.icon} size={22} />
      <span className="flex-1">{t(item.labelKey)}</span>
      <Icon name="chevronRight" size={18} />
    </NavLink>
  )
}

/** Slide-in side drawer for secondary destinations and the language switch. */
export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const { t } = useTranslation()
  const { activeCircle } = useCareCircle()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('drawer.title')}
        className={cn(
          'safe-top fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col bg-surface-lowest shadow-modal transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="min-w-0">
            <span className="block text-xl font-bold text-primary">{t('app.name')}</span>
            {activeCircle && (
              <span className="block truncate text-sm text-content-variant">
                {activeCircle.name}
              </span>
            )}
          </div>
          <IconButton icon="close" label={t('drawer.close')} onClick={onClose} />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-1 pt-3 text-sm font-semibold uppercase tracking-wide text-content-variant">
            {t('drawer.sectionCare')}
          </p>
          <div className="flex flex-col gap-1">
            {CARE_NAV.map((item) => (
              <DrawerLink key={item.path} item={item} onNavigate={onClose} />
            ))}
          </div>

          <p className="px-3 pb-1 pt-5 text-sm font-semibold uppercase tracking-wide text-content-variant">
            {t('drawer.sectionAccount')}
          </p>
          <div className="flex flex-col gap-1">
            {ACCOUNT_NAV.map((item) => (
              <DrawerLink key={item.path} item={item} onNavigate={onClose} />
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-4 border-t border-outline-variant p-4">
          <UserMenu />
          <LanguageToggle />
          <p className="text-center text-sm text-content-variant">
            {t('drawer.version', { version: APP_VERSION })}
          </p>
        </div>
      </aside>
    </>
  )
}
