import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Avatar, Button, Icon } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import { useProfile } from '@/features/profile'
import { useMedications } from '@/features/medications'
import { useShifts } from '@/features/shifts'
import { useRoutine } from '@/features/routine'
import { useDiary } from '@/features/diary'
import { DiaryCard } from '@/features/diary/components/DiaryCard'
import { DoseCard } from '@/features/medications/components/DoseCard'
import { RoutineItemCard } from '@/features/routine/components/RoutineItemCard'
import { SummaryTile } from './components/SummaryTile'

export function DashboardView() {
  const { t } = useTranslation()
  const { recipient } = useProfile()
  const { doses, markTaken, undo } = useMedications()
  const { activeShift } = useShifts()
  const { progress, markDone, undoLast } = useRoutine()
  const { entries } = useDiary()
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const runOn = async (key: string, action: () => Promise<void>) => {
    setBusyKey(key)
    try {
      await action()
    } finally {
      setBusyKey(null)
    }
  }

  const pendingDoses = doses.filter((d) => d.status === 'pending')
  const nextDose = pendingDoses[0]
  const doseOverdue = Boolean(nextDose && new Date(nextDose.scheduledFor).getTime() <= Date.now())

  const pendingRoutine = progress.filter((p) => p.doneCount < p.target)
  const nextRoutine = pendingRoutine[0]

  const pendingTotal = pendingDoses.length + pendingRoutine.length
  const latestEntry = entries[0]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Avatar name={recipient?.name ?? 'CuidaJunto'} src={recipient?.photo_url} size={52} />
        <div className="min-w-0">
          <p className="text-sm text-content-variant">{t('dashboard.caringFor')}</p>
          <h1 className="truncate text-2xl font-bold text-content">
            {recipient?.name ?? t('app.name')}
          </h1>
        </div>
      </header>

      {/* Today's Care Summary: the most urgent, most-scanned information, all above the fold. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-content">{t('dashboard.summaryTitle')}</h2>

        <div className="grid grid-cols-2 gap-3">
          <SummaryTile
            to={ROUTES.schedule}
            icon="users"
            label={t('dashboard.onDuty')}
            value={activeShift?.caregiver_name ?? t('shifts.nobody')}
          />
          <SummaryTile
            to={pendingTotal > 0 ? ROUTES.medications : ROUTES.routine}
            icon="alert"
            label={t('dashboard.pendingTasks')}
            value={t('dashboard.pendingCount', { count: pendingTotal })}
            urgent={pendingTotal > 0}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-content">{t('dashboard.nextDose')}</h3>
            <Link to={ROUTES.medications} className="text-base font-semibold text-primary">
              {t('dashboard.seeAll')}
            </Link>
          </div>
          {nextDose ? (
            <DoseCard
              dose={nextDose}
              busy={busyKey === nextDose.key}
              onMarkTaken={(d) => void runOn(d.key, () => markTaken(d))}
              onUndo={(d) => void runOn(d.key, () => undo(d))}
              isUpcoming={!doseOverdue}
            />
          ) : (
            <Card elevated={false}>
              <p className="text-base text-content-variant">{t('dashboard.allDosesDone')}</p>
            </Card>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-content">{t('dashboard.nextRoutine')}</h3>
            <Link to={ROUTES.routine} className="text-base font-semibold text-primary">
              {t('dashboard.seeAll')}
            </Link>
          </div>
          {nextRoutine ? (
            <RoutineItemCard
              progress={nextRoutine}
              busy={busyKey === nextRoutine.item.id}
              onMarkDone={(p) => void runOn(p.item.id, () => markDone(p))}
              onUndo={(p) => void runOn(p.item.id, () => undoLast(p))}
            />
          ) : (
            <Card elevated={false}>
              <p className="text-base text-content-variant">{t('dashboard.allRoutineDone')}</p>
            </Card>
          )}
        </div>
      </section>

      {/* Secondary information: worth a glance, but not competing with today's actions. */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-content">{t('dashboard.latestDiary')}</h2>
          <Link to={ROUTES.diary} className="text-base font-semibold text-primary">
            {t('dashboard.seeAll')}
          </Link>
        </div>
        {latestEntry ? (
          <DiaryCard entry={latestEntry} />
        ) : (
          <Card elevated={false}>
            <p className="text-base text-content-variant">{t('dashboard.noDiary')}</p>
          </Card>
        )}
      </section>

      <Link to={ROUTES.diary}>
        <Button fullWidth size="lg" leadingIcon={<Icon name="plus" size={22} />}>
          {t('diary.add')}
        </Button>
      </Link>
    </div>
  )
}
