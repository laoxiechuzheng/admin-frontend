import { cn } from "@/lib/utils"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from "react"

const Switch = forwardRef<
    ComponentRef<typeof SwitchPrimitives.Root>,
    ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/35",
            className,
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-white ring-0 transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
            )}
        />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
