import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { ButtonHTMLAttributes, forwardRef } from "react"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/85",
                destructive:
                    "border border-destructive/30 bg-destructive/10 text-destructive hover:border-destructive/50 hover:bg-destructive/15",
                outline: "border border-border bg-card text-foreground hover:bg-muted",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-3.5",
                sm: "h-8 px-3 text-xs",
                lg: "h-10 px-5 text-sm",
                icon: "h-9 w-9",
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
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }
