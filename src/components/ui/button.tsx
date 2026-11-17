import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { ButtonHTMLAttributes, forwardRef } from "react"

const buttonVariants = cva(
    "sh-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary bg-[image:var(--grad-accent)] text-primary-foreground shadow-[var(--shadow-surface)]",
                destructive: "bg-destructive text-destructive-foreground",
                outline: "border border-border bg-card text-foreground hover:border-input hover:bg-muted",
                secondary: "border border-border bg-card text-secondary-foreground hover:border-input hover:bg-muted",
                ghost: "text-muted-foreground hover:bg-foreground/[.06] hover:text-foreground active:bg-foreground/10",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4",
                sm: "h-8 px-3 text-[13px]",
                lg: "h-11 px-5 text-sm",
                icon: "ghost-icon h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                data-variant={variant ?? "default"}
                data-size={size ?? "default"}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }
