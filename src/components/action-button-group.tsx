import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Ban, Trash2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { IconButton } from "@/components/xui/icon-button"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"

interface ButtonGroupProps<E, U> {
    className?: string
    children: React.ReactNode
    delete: { fn: (id: E[]) => Promise<void>; id: E; mutate: KeyedMutator<U> }
}

interface BlockButtonGroupProps<E, U> {
    className?: string
    children?: React.ReactNode
    block: { fn: (id: E[]) => Promise<void>; id: E; mutate: KeyedMutator<U> }
}

export function ActionButtonGroup<E, U>({
    className,
    children,
    delete: { fn, id, mutate },
}: ButtonGroupProps<E, U>) {
    const { t } = useTranslation()
    const handleDelete = async () => {
        try {
            await fn([id])
        } catch (error: any) {
            toast(t("Error"), {
                description: error.message,
            })
        }
        await mutate()
    }

    return (
        <div className={cn("sh-actions", className)}>
            {children}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <IconButton variant="ghost" icon="trash" aria-label={t("ConfirmDeletion")} className="hover:bg-danger/10 hover:text-danger" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <span className="sh-confirm-icon"><Trash2 className="size-5" /></span>
                        <AlertDialogTitle>{t("ConfirmDeletion")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Results.ThisOperationIsUnrecoverable")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={handleDelete}
                        >
                            {t("Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export function BlockButtonGroup<E, U>({
    className,
    children,
    block: { fn, id, mutate },
}: BlockButtonGroupProps<E, U>) {
    const { t } = useTranslation()

    const handleBlock = async () => {
        try {
            await fn([id])
        } catch (error: any) {
            toast(t("Error"), {
                description: error.message,
            })
        }
        await mutate()
    }
    return (
        <div className={cn("sh-actions", className)}>
            {children}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <IconButton variant="ghost" icon="ban" aria-label={t("ConfirmBlock")} className="hover:bg-danger/10 hover:text-danger" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <span className="sh-confirm-icon"><Ban className="size-5" /></span>
                        <AlertDialogTitle>{t("ConfirmBlock")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Results.ThisOperationIsUnrecoverable")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Close")}</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={handleBlock}
                        >
                            {t("Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
