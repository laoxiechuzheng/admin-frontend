import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1.5 text-[13px] text-foreground transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive dark:bg-background",
                className,
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
