import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { ptBR, enUS } from '@clerk/localizations'
import { env, isClerkConfigured } from '@/config/env'
import { useLanguage } from '@/hooks/useLanguage'
import { ClerkAuthBridge } from './ClerkAuthBridge'
import { DemoAuthProvider } from './DemoAuthProvider'

/**
 * Provides a normalized auth context to the whole app.
 *
 * - With Clerk configured: wraps children in <ClerkProvider> (localized to the
 *   current app language) and bridges Clerk state into our AuthContext.
 * - Without Clerk: falls back to a demo provider so the public build still runs.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { current } = useLanguage()

  if (!isClerkConfigured) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>
  }

  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      localization={current === 'pt' ? ptBR : enUS}
      afterSignOutUrl={import.meta.env.BASE_URL}
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  )
}
