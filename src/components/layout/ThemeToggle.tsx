import { useTranslation } from 'react-i18next'
import { SegmentedControl } from '@/components/ui'
import { useTheme } from '@/hooks/useTheme'

/** Light / dark / system theme picker, shown in Settings. */
export function ThemeToggle() {
  const { t } = useTranslation()
  const { pref, setTheme, options } = useTheme()

  return (
    <SegmentedControl
      ariaLabel={t('theme.label')}
      value={pref}
      onChange={setTheme}
      segments={options.map((o) => ({ value: o, label: t(`theme.${o}`) }))}
    />
  )
}
