import * as React from 'react'
import { cn } from '@/lib/utils'
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({className,...props}, ref) { return <input ref={ref} className={cn('ui-input',className)} {...props}/> })
