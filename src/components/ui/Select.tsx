import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { inputClasses } from './TextField'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
}

/** Native select styled to match the text inputs. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ options, className, ...props }, ref) {
    return (
      <select ref={ref} className={cn(inputClasses, 'appearance-none pr-10', className)} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  },
)
