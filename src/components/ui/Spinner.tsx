import { cn } from '@/lib/cn'

interface SpinnerProps {
  size?: number
  className?: string
  label?: string
}

/** Minimal accessible loading spinner. */
export function Spinner({ size = 24, className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      style={{ width: size, height: size }}
      className={cn(
        'inline-block animate-spin rounded-pill border-[3px] border-primary/25 border-t-primary',
        className,
      )}
    />
  )
}
