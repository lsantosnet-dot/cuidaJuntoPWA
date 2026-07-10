import { useTranslation } from 'react-i18next'
import { Card, Avatar, Chip } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { formatDayLabel, formatTime } from '@/lib/datetime'
import { MOOD_EMOJI, type DiaryEntryRow } from '../types'

/** One diary entry: author, timestamp, note and well-being tags. */
export function DiaryCard({ entry }: { entry: DiaryEntryRow }) {
  const { t } = useTranslation()
  const { current } = useLanguage()

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar name={entry.author_name ?? '?'} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-content">{entry.author_name}</p>
          <p className="text-sm text-content-variant">
            {formatDayLabel(entry.created_at, current)} · {formatTime(entry.created_at, current)}
          </p>
        </div>
        {entry.mood && (
          <span className="text-2xl" aria-label={t(`diary.mood.${entry.mood}`)}>
            {MOOD_EMOJI[entry.mood]}
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-base text-content">{entry.content}</p>

      {(entry.sleep_quality || entry.appetite) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.sleep_quality && (
            <Chip tone="teal">{t('diary.sleepLabel')}: {t(`diary.sleep.${entry.sleep_quality}`)}</Chip>
          )}
          {entry.appetite && (
            <Chip tone="sand">{t('diary.appetiteLabel')}: {t(`diary.appetite.${entry.appetite}`)}</Chip>
          )}
        </div>
      )}
    </Card>
  )
}
