// Edge Function: notify
// Pushes a message to all members of a circle. Called from the app (e.g. SOS).
// Auth: the caller's Clerk token is decoded (not verified here — set
// verify_jwt=false) and checked against circle membership to prevent abuse.
import {
  adminClient,
  configureVapid,
  notifyCircle,
  subFromAuth,
  CORS,
  json,
} from '../_shared/webpush.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  try {
    const { circleId, title, body, url, excludeSelf } = await req.json()
    if (!circleId || !title) return json({ error: 'circleId and title are required' }, 400)

    const admin = adminClient()
    const callerSub = subFromAuth(req.headers.get('Authorization'))

    // Only members of the circle may send to it.
    if (!callerSub) return json({ error: 'unauthenticated' }, 401)
    const { data: membership } = await admin
      .from('memberships')
      .select('id')
      .eq('circle_id', circleId)
      .eq('user_id', callerSub)
      .maybeSingle()
    if (!membership) return json({ error: 'forbidden' }, 403)

    configureVapid()
    const sent = await notifyCircle(
      admin,
      circleId,
      { title, body, url },
      excludeSelf ? callerSub : null,
    )

    return json({ sent })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
