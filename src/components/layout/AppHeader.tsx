import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/ui'
import { SosButton } from './SosButton'

interface AppHeaderProps {
  onOpenMenu: () => void
}

/** Top app bar: menu trigger, brand, and the persistent SOS action. */
export function AppHeader({ onOpenMenu }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-app items-center gap-2 px-4">
        <IconButton icon="menu" label={t('header.openMenu')} onClick={onOpenMenu} />
        <span className="flex-1 text-xl font-bold text-primary">{t('app.name')}</span>
        <SosButton />
      </div>
    </header>
  )
}
