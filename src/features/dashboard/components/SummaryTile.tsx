import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui'

interface SummaryTileProps {
  to: string
  icon: IconName
  label: string
  value: string
}

/** Compact stat tile linking to a module. */
export function SummaryTile({ to, icon, label, value }: SummaryTileProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-2 rounded-card bg-surface-lowest p-4 shadow-card transition-transform active:scale-[0.98] dark:ring-1 dark:ring-white/10"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary/10 text-primary">
        <Icon name={icon} size={22} />
      </span>
      <span className="text-sm font-semibold text-content-variant">{label}</span>
      <span className="text-lg font-bold leading-tight text-content">{value}</span>
    </Link>
  )
}
