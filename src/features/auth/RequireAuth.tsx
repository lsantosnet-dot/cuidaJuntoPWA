import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'
import { SignInScreen } from './SignInScreen'

/**
 * Gates the app behind authentication.
 * - Still initializing → full-page loader.
 * - Signed out (Clerk configured) → sign-in screen.
 * - Signed in, or demo mode → renders children.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isReady, isSignedIn } = useAuth()
  const { t } = useTranslation()

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <p className="text-base text-content-variant">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <SignInScreen />
  }

  return <>{children}</>
}
