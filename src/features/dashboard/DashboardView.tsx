import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Avatar, Button, Icon } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import { useProfile } from '@/features/profile'
import { useMedications } from '@/features/medications'
import { useShifts } from '@/features/shifts'
import { useDiary } from '@/features/diary'
import { DiaryCard } from '@/features/diary/components/DiaryCard'
import { DoseCard } from '@/features/medications/components/DoseCard'
import { SummaryTile } from './components/SummaryTile'

export function DashboardView() {
  const { t } = useTranslation()
  const { recipient } = useProfile()
  const { doses, markTaken, undo } = useMedications()
  const { activeShift } = useShifts()
  const { entries } = useDiary()

  const pending = doses.filter((d) => d.status === 'pending')
  const nextDose = pending[0]
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

      <div className="grid grid-cols-2 gap-3">
        <SummaryTile
          to={ROUTES.schedule}
          icon="calendar"
          label={t('dashboard.onDuty')}
          value={activeShift?.caregiver_name ?? t('shifts.nobody')}
        />
        <SummaryTile
          to={ROUTES.medications}
          icon="pill"
          label={t('dashboard.medsToday')}
          value={t('medications.remaining', { count: pending.length })}
        />
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-content">{t('dashboard.nextDose')}</h2>
          <Link to={ROUTES.medications} className="text-base font-semibold text-primary">
            {t('dashboard.seeAll')}
          </Link>
        </div>
        {nextDose ? (
          <DoseCard dose={nextDose} onMarkTaken={markTaken} onUndo={undo} />
        ) : (
          <Card elevated={false}>
            <p className="text-base text-content-variant">{t('dashboard.allDosesDone')}</p>
          </Card>
        )}
      </section>

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
