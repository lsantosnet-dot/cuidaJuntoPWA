import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { inputClasses } from './TextField'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

/** Multi-line input sharing the TextField look, sized for short notes. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ className, rows = 3, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(inputClasses, 'min-h-[88px] resize-y py-3', className)}
        {...props}
      />
    )
  },
)
