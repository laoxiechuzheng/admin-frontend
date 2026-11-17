import { cn } from "@/lib/utils"
import { ComponentProps, forwardRef } from "react"

const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "sh-input flex min-h-24 w-full rounded-[10px] border border-input px-3 py-2 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground placeholder:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
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
