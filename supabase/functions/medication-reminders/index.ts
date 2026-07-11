// Edge Function: medication-reminders
// Invoked on a schedule (pg_cron). For every active medication whose scheduled
// time just came due and has no "taken" log today, pushes a reminder to the
// circle. Protect with a shared secret since verify_jwt is off.
import { adminClient, configureVapid, notifyCircle, json } from '../_shared/webpush.ts'

const REMINDER_TZ = Deno.env.get('REMINDER_TZ') ?? 'America/Sao_Paulo'
const WINDOW_MIN = Number(Deno.env.get('REMINDER_WINDOW_MIN') ?? '5')

function nowInTz(tz: string): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Local HH:mm of an ISO timestamp, in the reminder timezone. */
function clockInTz(iso: string, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>
  return `${parts.hour}:${parts.minute}`
}

/** Local YYYY-MM-DD of an ISO timestamp, in the reminder timezone. */
function dateInTz(iso: string, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>
  return `${parts.year}-${parts.month}-${parts.day}`
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET')
  if (secret && req.headers.get('x-cron-secret') !== secret) {
    return json({ error: 'unauthorized' }, 401)
  }

  try {
    const admin = adminClient()
    const { date, minutes: nowMin } = nowInTz(REMINDER_TZ)

    const { data: meds } = await admin
      .from('medications')
      .select('id, circle_id, name, dosage, schedule_times, active')
      .eq('active', true)

    configureVapid()
    let reminders = 0

    for (const med of meds ?? []) {
      const dueTimes = (med.schedule_times ?? []).filter((tm: string) => {
        const diff = nowMin - toMinutes(tm)
        return diff >= 0 && diff < WINDOW_MIN
      })
      if (dueTimes.length === 0) continue

      // Fetch a generous window (naive "date T00:00" strings would be read as
      // UTC and shift the day), then match logs by TZ-local date + clock.
      const since = new Date(Date.now() - 26 * 3600 * 1000).toISOString()
      const { data: logs } = await admin
        .from('medication_logs')
        .select('status, scheduled_for')
        .eq('medication_id', med.id)
        .gte('scheduled_for', since)

      for (const tm of dueTimes) {
        const alreadyTaken = (logs ?? []).some(
          (l) =>
            l.status === 'taken' &&
            dateInTz(l.scheduled_for, REMINDER_TZ) === date &&
            clockInTz(l.scheduled_for, REMINDER_TZ) === tm,
        )
        if (alreadyTaken) continue

        await notifyCircle(admin, med.circle_id, {
          title: '💊 Hora do remédio',
          body: `${med.name}${med.dosage ? ` · ${med.dosage}` : ''} (${tm})`,
          url: '/cuidaJuntoPWA/',
        })
        reminders++
      }
    }

    return json({ ok: true, reminders })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
