import { cn } from "@/lib/utils"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from "react"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = forwardRef<
    ComponentRef<typeof PopoverPrimitive.Content>,
    ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                "sh-popover z-50 w-72 rounded-xl border bg-popover p-3 text-[13px] text-popover-foreground shadow-overlay outline-none",
                className,
            )}
            {...props}
        />
    </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
