import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SideDrawer } from './SideDrawer'
import { BottomNav } from './BottomNav'
import { DemoModeBanner } from '@/components/common/DemoModeBanner'
import { useDisclosure } from '@/hooks/useDisclosure'
import { TutorialProvider } from '@/features/tutorial'

/**
 * Application shell: fixed header + SOS, slide-in drawer, routed content, and
 * the bottom navigation. Content is centered and width-capped for a phone-like
 * feel on larger screens. Also owns the feature tutorial, which auto-opens on
 * first visit and can be reopened from the side drawer.
 */
export function AppShell() {
  const drawer = useDisclosure()

  return (
    <TutorialProvider>
      <div className="flex min-h-dvh flex-col bg-surface">
        <AppHeader onOpenMenu={drawer.open} />
        <SideDrawer isOpen={drawer.isOpen} onClose={drawer.close} />
        <DemoModeBanner />

        <main className="mx-auto w-full max-w-app flex-1 px-5 py-6">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </TutorialProvider>
  )
}
