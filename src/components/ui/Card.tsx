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
        elevated ? 'shadow-card' : 'border border-outline-variant',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
