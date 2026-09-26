import * as React from 'react'
import { Checkbox as Primitive } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
export const Checkbox = React.forwardRef<React.ElementRef<typeof Primitive.Root>, React.ComponentPropsWithoutRef<typeof Primitive.Root>>(function Checkbox({className,...props},ref) { return <Primitive.Root ref={ref} className={cn('ui-checkbox',className)} {...props}><Primitive.Indicator>{props.checked === 'indeterminate' ? <Minus size={12}/> : <Check size={12}/>}</Primitive.Indicator></Primitive.Root> })
