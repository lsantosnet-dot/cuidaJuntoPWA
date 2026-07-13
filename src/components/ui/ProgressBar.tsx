import { cn } from '@/lib/cn'

interface ProgressBarProps {
  /** 0–1 completion ratio; clamped for safety. */
  value: number
  className?: string
  label?: string
}

/** Slim rounded progress track used for daily-completion indicators. */
export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2.5 w-full overflow-hidden rounded-pill bg-surface-container', className)}
    >
      <div
        className="h-full rounded-pill bg-secondary transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
