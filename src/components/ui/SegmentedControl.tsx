import { cn } from '@/lib/cn'

export interface Segment<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[]
  value: T | null
  onChange: (value: T) => void
  ariaLabel: string
}

/**
 * Pill-style single-choice control (sleep quality, appetite, mood…). Wraps on
 * small screens and keeps a 48px touch target per option.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {segments.map((s) => {
        const active = s.value === value
        return (
          <button
            key={s.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(s.value)}
            className={cn(
              'min-h-touch rounded-pill px-4 text-base font-semibold transition-colors',
              active
                ? 'bg-primary text-primary-on'
                : 'bg-surface-container text-content hover:bg-surface-high',
            )}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
