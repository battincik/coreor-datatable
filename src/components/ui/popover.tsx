import * as React from 'react'
import { Popover as P } from 'radix-ui'
import { cn } from '@/lib/utils'
export const Popover = P.Root
export const PopoverTrigger = P.Trigger
export const PopoverContent = React.forwardRef<React.ElementRef<typeof P.Content>, React.ComponentPropsWithoutRef<typeof P.Content>>(function Content({className,sideOffset=5,...props},ref) { return <P.Portal><P.Content ref={ref} sideOffset={sideOffset} className={cn('ui-menu',className)} {...props}/></P.Portal> })
