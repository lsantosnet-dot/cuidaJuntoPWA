import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import { useCareCircle } from './CareCircleContext'
import { CreateCircleScreen } from './CreateCircleScreen'

/** True while the hash route points at the invite-acceptance screen. */
function useOnJoinRoute(): boolean {
  const [onJoin, setOnJoin] = useState(() =>
    window.location.hash.startsWith(`#${ROUTES.join}`),
  )
  useEffect(() => {
    const update = () => setOnJoin(window.location.hash.startsWith(`#${ROUTES.join}`))
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return onJoin
}

/**
 * Between auth and the app shell: while loading circles show a spinner; if the
 * user has none, show onboarding — unless they're following an invite link, in
 * which case let the join screen through so they can accept. Inert in demo.
 */
export function CareCircleGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { isEnabled, isLoading, needsOnboarding } = useCareCircle()
  const onJoinRoute = useOnJoinRoute()

  if (isEnabled && isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  if (needsOnboarding && !onJoinRoute) {
    return <CreateCircleScreen />
  }

  return <>{children}</>
}
