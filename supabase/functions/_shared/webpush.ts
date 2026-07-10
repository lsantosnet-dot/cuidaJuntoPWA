// Shared Web Push helper for the Edge Functions.
// Uses the npm `web-push` library (VAPID signing + payload encryption).
import webpush from 'npm:web-push@3.6.7'
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

export function configureVapid() {
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@cuidajunto.app',
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )
}

export interface PushPayload {
  title: string
  body?: string
  url?: string
  tag?: string
}

/** Sends a payload to every push subscription of the given users. */
export async function sendToUsers(
  admin: SupabaseClient,
  userIds: string[],
  payload: PushPayload,
): Promise<number> {
  if (userIds.length === 0) return 0

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds)

  const body = JSON.stringify({ tag: 'cuidajunto', ...payload })
  let sent = 0

  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        )
        sent++
      } catch (err) {
        // Prune subscriptions the push service says are gone.
        const code = (err as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    }),
  )

  return sent
}

/** Notifies all members of a circle, optionally excluding one user. */
export async function notifyCircle(
  admin: SupabaseClient,
  circleId: string,
  payload: PushPayload,
  excludeUserId?: string | null,
): Promise<number> {
  const { data: members } = await admin
    .from('memberships')
    .select('user_id')
    .eq('circle_id', circleId)

  let userIds = (members ?? []).map((m) => m.user_id as string)
  if (excludeUserId) userIds = userIds.filter((u) => u !== excludeUserId)

  return sendToUsers(admin, userIds, payload)
}

/** Extracts the Clerk `sub` claim from a Bearer token, without verifying it. */
export function subFromAuth(authHeader: string | null): string | null {
  if (!authHeader) return null
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const json = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return json.sub ?? null
  } catch {
    return null
  }
}

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
