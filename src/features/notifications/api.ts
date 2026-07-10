import type { AppSupabaseClient } from '@/lib/supabase'

/** Upserts the current device's push subscription (unique per endpoint). */
export async function saveSubscription(
  supabase: AppSupabaseClient,
  input: { userId: string; endpoint: string; p256dh: string; auth: string; userAgent: string | null },
): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent,
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw error
}

export async function deleteSubscription(
  supabase: AppSupabaseClient,
  endpoint: string,
): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) throw error
}

/**
 * Asks the `notify` Edge Function to push a message to every member of a circle
 * (optionally excluding the sender). Used by SOS and future in-app events.
 */
export async function sendNotify(
  supabase: AppSupabaseClient,
  input: { circleId: string; title: string; body?: string; url?: string; excludeSelf?: boolean },
): Promise<void> {
  const { error } = await supabase.functions.invoke('notify', { body: input })
  if (error) throw error
}
