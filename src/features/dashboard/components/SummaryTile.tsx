import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui'
import { cn } from '@/lib/cn'

interface SummaryTileProps {
  to: string
  icon: IconName
  label: string
  value: string
  /** Highlights the tile with the amber "needs attention" accent (e.g. overdue doses, open tasks). */
  urgent?: boolean
}

/** Compact stat tile linking to a module. */
export function SummaryTile({ to, icon, label, value, urgent }: SummaryTileProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col gap-2 rounded-card bg-surface-lowest p-4 shadow-card transition-transform active:scale-[0.98] dark:ring-1 dark:ring-white/10',
        urgent && 'ring-2 ring-tertiary dark:ring-tertiary',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-pill',
          urgent ? 'bg-tertiary-container text-tertiary-on-container' : 'bg-primary/10 text-primary',
        )}
      >
        <Icon name={icon} size={22} />
      </span>
      <span className="text-sm font-semibold text-content-variant">{label}</span>
      <span className="text-lg font-bold leading-tight text-content">{value}</span>
    </Link>
  )
}
