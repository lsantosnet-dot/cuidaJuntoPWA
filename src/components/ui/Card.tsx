import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Renders a soft "lifted" shadow to signal the card is tappable. */
  elevated?: boolean
}

/**
 * Level 1 container: white surface, rounded corners, optional ambient shadow.
 * The base building block that medication, diary and history cards compose.
 */
export function Card({ elevated = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-surface-lowest p-4',
        // Shadows are invisible on dark surfaces, so a hairline ring keeps the
        // card readable as an elevated block in dark mode.
        elevated
          ? 'shadow-card dark:ring-1 dark:ring-white/10'
          : 'border border-outline-variant',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
