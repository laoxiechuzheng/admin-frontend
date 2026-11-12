import { cn } from "@/lib/utils"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from "react"

const Tabs = TabsPrimitive.Root

const TabsList = forwardRef<
    ComponentRef<typeof TabsPrimitive.List>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-md border bg-muted p-0.5 text-muted-foreground",
            className,
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = forwardRef<
    ComponentRef<typeof TabsPrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex h-full items-center justify-center whitespace-nowrap rounded-[5px] px-3 text-[13px] font-medium transition-colors duration-150 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_0_1px_hsl(var(--border))]",
            className,
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = forwardRef<
    ComponentRef<typeof TabsPrimitive.Content>,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={cn("mt-3", className)} {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
