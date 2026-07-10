import { useCallback, useEffect, useState } from 'react'
import { env, isPushConfigured } from '@/config/env'
import { useAuth } from '@/features/auth'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { urlBase64ToUint8Array } from './pushKey'
import { saveSubscription, deleteSubscription } from './api'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export interface PushState {
  /** Browser supports the Push API and the app is configured for it. */
  supported: boolean
  configured: boolean
  /** iOS requires the PWA to be installed to the home screen for push. */
  iosNeedsInstall: boolean
  permission: NotificationPermission
  subscribed: boolean
  busy: boolean
  error: string | null
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function usePushNotifications(): PushState {
  const supabase = useSupabaseClient()
  const { user, isDemo } = useAuth()

  const supported =
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  const configured = isPushConfigured && supabase !== null && !isDemo

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  )
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supported) return
    void navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(sub !== null)
    })
  }, [supported])

  const subscribe = useCallback(async () => {
    if (!supabase || !user) return
    setBusy(true)
    setError(null)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey),
      })
      const json = sub.toJSON()
      await saveSubscription(supabase, {
        userId: user.id,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
        userAgent: navigator.userAgent,
      })
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao ativar notificações')
    } finally {
      setBusy(false)
    }
  }, [supabase, user])

  const unsubscribe = useCallback(async () => {
    if (!supabase) return
    setBusy(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await deleteSubscription(supabase, sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao desativar notificações')
    } finally {
      setBusy(false)
    }
  }, [supabase])

  return {
    supported,
    configured,
    iosNeedsInstall: isIOS() && !isStandalone(),
    permission,
    subscribed,
    busy,
    error,
    subscribe,
    unsubscribe,
  }
}
