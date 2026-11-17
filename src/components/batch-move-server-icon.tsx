import { batchMoveServer } from "@/api/server"
import { Button, ButtonProps } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconButton } from "@/components/xui/icon-button"
import "@/styles/forms.css"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { FormSheetSection } from "./form-sheet"
import { Textarea } from "./ui/textarea"

interface BatchMoveServerIconProps extends ButtonProps {
    serverIds: number[]
}

export const BatchMoveServerIcon: React.FC<BatchMoveServerIconProps> = ({
    serverIds,
    ...props
}) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [toUserId, setToUserId] = useState<number | undefined>(undefined)

    const onSubmit = async () => {
        let results
        try {
            results = await batchMoveServer({
                ids: serverIds,
                to_user: toUserId!,
            })
        } catch (e) {
            console.error(e)
            toast(t("Error"), {
                description: t("Results.UnExpectedError"),
            })
            return
        }

        // The backend now responds per-server; render a structured summary
        // instead of "Done" so the operator can see which ids hit a snag
        // (DisableCommandExecute / already_transferring / etc). Pending ids
        // remain async — watching /ws/transfer or the Transfers page will
        // surface their terminal state.
        const pending = results.filter((r) => r.status === "pending").length
        const denied = results.filter((r) => r.status === "permission_denied").length
        const dup = results.filter((r) => r.status === "already_transferring").length
        const missing = results.filter((r) => r.status === "server_not_found").length
        const same = results.filter((r) => r.status === "same_owner").length
        const tooOld = results.filter((r) => r.status === "agent_too_old").length

        const parts: string[] = []
        if (pending) parts.push(t("Transfer.PendingCount", { count: pending }))
        if (denied) parts.push(t("Transfer.PermissionDeniedCount", { count: denied }))
        if (dup) parts.push(t("Transfer.AlreadyTransferringCount", { count: dup }))
        if (missing) parts.push(t("Transfer.ServerNotFoundCount", { count: missing }))
        if (same) parts.push(t("Transfer.SameOwnerCount", { count: same }))
        if (tooOld) parts.push(t("Transfer.AgentTooOldCount", { count: tooOld }))

        toast(t("Transfer.BatchSubmitted"), {
            description: parts.join(" · ") || t("Done"),
        })
        setOpen(false)
    }

    return serverIds.length < 1 ? (
        <IconButton
            {...props}
            icon="user-pen"
            onClick={() => {
                toast(t("Error"), {
                    description: t("Results.NoRowsAreSelected"),
                })
            }}
        />
    ) : (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <IconButton {...props} icon="user-pen" />
            </DialogTrigger>
            <DialogContent variant="sheet" size="sm">
                <div className="fs-sheet-form">
                    <DialogHeader className="fs-sheet-head">
                        <DialogTitle>{t("BatchMoveServer")}</DialogTitle>
                        <DialogDescription />
                    </DialogHeader>
                    <div className="fs-sheet-body">
                        <FormSheetSection title={t("v2Forms.sections.transfer")}>
                            <div className="space-y-2">
                                <Label>{t("Servers")}</Label>
                                <Textarea disabled>{serverIds.join(", ")}</Textarea>
                            </div>
                            <div className="space-y-2">
                                <Label>{t("ToUser")}</Label>
                                <Input
                                    type="number"
                                    placeholder="User ID"
                                    value={toUserId}
                                    onChange={(e) => {
                                        setToUserId(parseInt(e.target.value, 10))
                                    }}
                                />
                            </div>
                        </FormSheetSection>
                    </div>
                    <DialogFooter className="fs-sheet-foot">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                {t("Cancel")}
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={!toUserId || toUserId == 0}
                            type="submit"
                            onClick={onSubmit}
                        >
                            {t("Move")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
