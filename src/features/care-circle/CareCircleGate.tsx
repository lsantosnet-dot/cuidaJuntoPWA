import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui'
import { useCareCircle } from './CareCircleContext'
import { CreateCircleScreen } from './CreateCircleScreen'

/**
 * Between auth and the app shell: while loading circles show a spinner; if the
 * user has none, show onboarding; otherwise render the app. In demo mode this
 * is inert (isEnabled is false) and children render immediately.
 */
export function CareCircleGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { isEnabled, isLoading, needsOnboarding } = useCareCircle()

  if (isEnabled && isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  if (needsOnboarding) {
    return <CreateCircleScreen />
  }

  return <>{children}</>
}
