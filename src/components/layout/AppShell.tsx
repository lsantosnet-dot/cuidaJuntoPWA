import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SideDrawer } from './SideDrawer'
import { BottomNav } from './BottomNav'
import { useDisclosure } from '@/hooks/useDisclosure'

/**
 * Application shell: fixed header + SOS, slide-in drawer, routed content, and
 * the bottom navigation. Content is centered and width-capped for a phone-like
 * feel on larger screens.
 */
export function AppShell() {
  const drawer = useDisclosure()

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <AppHeader onOpenMenu={drawer.open} />
      <SideDrawer isOpen={drawer.isOpen} onClose={drawer.close} />

      <main className="mx-auto w-full max-w-app flex-1 px-5 py-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
