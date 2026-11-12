import { cn } from "@/lib/utils"
import { ComponentProps, forwardRef } from "react"

const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive dark:bg-background",
                    className,
                )}
                ref={ref}
                {...props}
            />
        )
    },
)
Textarea.displayName = "Textarea"

export { Textarea }
