import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "sh-input flex h-10 w-full rounded-[10px] border border-input px-3 py-2 text-sm text-foreground transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
                className,
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
