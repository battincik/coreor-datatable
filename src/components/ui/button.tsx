import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary'; size?: 'default' | 'sm' | 'icon'; asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button({ className, variant='default', size='default', asChild=false, ...props }, ref) {
  const Component = asChild ? Slot.Root : 'button'
  return <Component ref={ref} className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)} {...props}/>
})
