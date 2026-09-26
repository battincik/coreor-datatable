import * as React from 'react'
import { Tooltip as T } from 'radix-ui'
import { cn } from '@/lib/utils'

export const TooltipProvider = T.Provider
export const Tooltip = T.Root
export const TooltipTrigger = T.Trigger
export const TooltipContent = React.forwardRef<React.ElementRef<typeof T.Content>, React.ComponentPropsWithoutRef<typeof T.Content>>(function Content({ className, sideOffset = 7, ...props }, ref) {
  return <T.Portal><T.Content ref={ref} sideOffset={sideOffset} className={cn('grid-tooltip', className)} {...props}/></T.Portal>
})
