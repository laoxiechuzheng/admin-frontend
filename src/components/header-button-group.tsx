import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Ban, Trash2 } from "lucide-react"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"

interface ButtonGroupProps<E, U> { className?: string; children?: ReactNode; delete: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> } }
interface ButtonBlockGroupProps<E, U> { className?: string; children?: ReactNode; block: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> } }

function BulkAction<E, U>({ className, children, action, block = false }: { className?: string; children?: ReactNode; action: { fn: (id: E[]) => Promise<void>; id: E[]; mutate: KeyedMutator<U> }; block?: boolean }) {
    const { t } = useTranslation()
    const { fn, id, mutate } = action
    const Icon = block ? Ban : Trash2
    const label = t(block ? "v2Shell.actions.blockSelected" : "v2Shell.actions.deleteSelected")
    const handle = async () => {
        if (!id.length) { toast(t("Error"), { description: t("Results.NoRowsAreSelected") }); return }
        try { await fn(id) } catch (error: any) { toast(t("Error"), { description: error.message }) }
        await mutate()
    }
    return <div className={cn("sh-bulk-actions", className)}>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={id.length ? "outline" : "ghost"} size={id.length ? "sm" : "icon"} disabled={!id.length} aria-label={label} title={label} className={id.length ? "sh-bulk-danger" : undefined}>
                    <Icon />{id.length > 0 && label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><span className="sh-confirm-icon"><Icon className="size-5" /></span><AlertDialogTitle>{t(block ? "ConfirmBlock" : "ConfirmDeletion")}</AlertDialogTitle><AlertDialogDescription>{t("Results.ThisOperationIsUnrecoverable")}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>{t("Close")}</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handle}>{t("Confirm")}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        {children}
    </div>
}
export function HeaderButtonGroup<E, U>({ delete: action, ...props }: ButtonGroupProps<E, U>) { return <BulkAction {...props} action={action} /> }
export function HeaderBlockButtonGroup<E, U>({ block: action, ...props }: ButtonBlockGroupProps<E, U>) { return <BulkAction {...props} action={action} block /> }
