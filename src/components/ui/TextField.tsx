import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const inputClasses = cn(
  'min-h-[56px] w-full rounded-input border-[1.5px] border-outline-variant bg-surface-lowest',
  'px-4 text-base text-content placeholder:text-content-variant/70',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
)

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>

/** Large 56px text input with a clear focus ring. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClasses, className)} {...props} />
  },
)
