import { cn } from "@/lib/utils"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { type VariantProps, cva } from "class-variance-authority"
import { X } from "lucide-react"
import {
    ComponentPropsWithoutRef,
    ComponentRef,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    forwardRef,
} from "react"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const sheetVariants = cva(
    "fixed z-50 gap-4 bg-card p-5 shadow-overlay transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=open]:duration-200",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
            },
        },
        defaultVariants: {
            side: "right",
        },
    },
)

interface SheetContentProps
    extends
        ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
        VariantProps<typeof sheetVariants> {
    setOpen: Dispatch<SetStateAction<boolean>>
}

const SheetContent = forwardRef<ComponentRef<typeof SheetPrimitive.Content>, SheetContentProps>(
    ({ side = "right", className, children, setOpen, ...props }, ref) => (
        <SheetPortal>
            <SheetPrimitive.Content
                ref={ref}
                className={cn(sheetVariants({ side }), className)}
                {...props}
            >
                {children}
                <SheetPrimitive.Close className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none">
                    <X
                        className="h-4 w-4"
                        onClick={() => {
                            setOpen(false)
                        }}
                    />
                    <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </SheetPortal>
    ),
)
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1 text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = forwardRef<
    ComponentRef<typeof SheetPrimitive.Title>,
    ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Title
        ref={ref}
        className={cn("text-base font-semibold text-foreground", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = forwardRef<
    ComponentRef<typeof SheetPrimitive.Description>,
    ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Description
        ref={ref}
        className={cn("text-[13px] text-muted-foreground", className)}
        {...props}
    />
))
SheetDescription.displayName = "SheetDescription"

export {
    Sheet,
    SheetPortal,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
