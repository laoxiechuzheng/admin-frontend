import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"
import { HTMLAttributes } from "react"

// Signal badge: 20px high, 4px radius, 12px text, semantic color on a 12% tint.
const badgeVariants = cva(
    "inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-[4px] border border-transparent px-1.5 text-xs font-medium leading-none transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary/12 text-primary",
                secondary: "bg-muted text-muted-foreground",
                destructive: "bg-danger/12 text-danger",
                success: "bg-success/12 text-success",
                warning: "bg-warning/12 text-warning",
                neutral: "bg-neutral-status/15 text-muted-foreground",
                outline: "border-border text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
)

export interface BadgeProps
    extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
