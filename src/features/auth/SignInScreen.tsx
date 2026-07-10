import { SignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'

/**
 * Full-page sign-in, shown by {@link RequireAuth} when Clerk is configured and
 * the visitor is signed out. Uses virtual routing so it needs no dedicated
 * routes and works under the app's HashRouter.
 */
export function SignInScreen() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-5 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-primary">{t('app.name')}</h1>
        <p className="mt-1 text-base text-content-variant">{t('app.tagline')}</p>
      </header>
      <SignIn
        routing="virtual"
        appearance={{
          variables: {
            colorPrimary: '#00535b',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  )
}
