import * as React from 'react'
import { DropdownMenu as P } from 'radix-ui'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
export const DropdownMenu = P.Root
export const DropdownMenuTrigger = P.Trigger
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof P.Content>, React.ComponentPropsWithoutRef<typeof P.Content>>(function Content({className,sideOffset=5,...props},ref) { return <P.Portal><P.Content ref={ref} sideOffset={sideOffset} className={cn('ui-menu',className)} {...props}/></P.Portal> })
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof P.Item>, React.ComponentPropsWithoutRef<typeof P.Item>>(function Item({className,...props},ref) { return <P.Item ref={ref} className={cn('ui-menu-item',className)} {...props}/> })
export const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof P.CheckboxItem>, React.ComponentPropsWithoutRef<typeof P.CheckboxItem>>(function CheckboxItem({className,children,...props},ref) { return <P.CheckboxItem ref={ref} className={cn('ui-menu-item ui-menu-check',className)} {...props}><P.ItemIndicator><Check size={14}/></P.ItemIndicator>{children}</P.CheckboxItem> })
export const DropdownMenuLabel = ({className,...props}: React.ComponentProps<typeof P.Label>) => <P.Label className={cn('ui-menu-label',className)} {...props}/>
export const DropdownMenuSeparator = ({className,...props}: React.ComponentProps<typeof P.Separator>) => <P.Separator className={cn('ui-menu-separator',className)} {...props}/>
