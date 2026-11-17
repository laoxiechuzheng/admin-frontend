import { setServerConfig } from "@/api/server"
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
import { Textarea } from "@/components/ui/textarea"
import { IconButton } from "@/components/xui/icon-button"
import "@/styles/forms.css"
import { ModelServerTaskResponse } from "@/types"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { FormSheetSection } from "./form-sheet"
import { Pusher } from "./xui/pusher"

interface ServerConfigCardBatchProps extends ButtonProps {
    sid: number[]
}

export const ServerConfigCardBatch: React.FC<ServerConfigCardBatchProps> = ({ sid, ...props }) => {
    const { t } = useTranslation()
    const [data, setData] = useState<Record<string, any>>({})
    const [open, setOpen] = useState(false)
    const [currentKey, setCurrentKey] = useState<string>("")
    const [currentVal, setCurrentVal] = useState<string>("")

    const onSubmit = async () => {
        let resp: ModelServerTaskResponse = {}
        try {
            resp = await setServerConfig({ config: JSON.stringify(data), servers: sid })
        } catch (e) {
            console.error(e)
            toast(t("Error"), {
                description: t("Results.UnExpectedError"),
            })
            return
        }
        toast(t("Done"), {
            description:
                t("Results.ForceUpdate") +
                (resp.success?.length ? t(`Success`) + ` [${resp.success.join(",")}]` : "") +
                (resp.failure?.length ? t(`Failure`) + ` [${resp.failure.join(",")}]` : "") +
                (resp.offline?.length ? t(`Offline`) + ` [${resp.offline.join(",")}]` : ""),
        })
        setOpen(false)
    }

    return sid.length < 1 ? (
        <IconButton
            {...props}
            icon="cog"
            onClick={() => {
                toast(t("Error"), {
                    description: t("Results.NoRowsAreSelected"),
                })
            }}
        />
    ) : (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <IconButton {...props} icon="cog" />
            </DialogTrigger>
            <DialogContent variant="sheet" size="md">
                <div className="fs-sheet-form">
                    <DialogHeader className="fs-sheet-head">
                        <DialogTitle>{t("EditServerConfig")}</DialogTitle>
                        <DialogDescription />
                    </DialogHeader>
                    <div className="fs-sheet-body">
                        <FormSheetSection title={t("v2Forms.sections.advanced")}>
                            <div className="fs-span-2 space-y-2">
                                <Label>{t("Option")}</Label>
                                <Input
                                    type="text"
                                    placeholder="option"
                                    value={currentKey}
                                    onChange={(e) => {
                                        setCurrentKey(e.target.value)
                                    }}
                                />
                            </div>
                            <div className="fs-span-2 space-y-2">
                                <Label>{t("Value")}</Label>
                                <Textarea
                                    className="fs-code resize-y"
                                    value={currentVal}
                                    onChange={(e) => {
                                        setCurrentVal(e.target.value)
                                    }}
                                />
                            </div>
                            <div className="fs-span-2">
                                <Pusher property={[currentKey, currentVal]} setData={setData} />
                            </div>
                        </FormSheetSection>
                    </div>
                    <DialogFooter className="fs-sheet-foot">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                {t("Close")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" onClick={onSubmit}>
                            {t("Submit")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
