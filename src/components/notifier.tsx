import { createNotification, updateNotification } from "@/api/notification"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IconButton } from "@/components/xui/icon-button"
import { asOptionalField } from "@/lib/utils"
import "@/styles/forms.css"
import { ModelNotification } from "@/types"
import { nrequestMethods, nrequestTypes } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"
import { z } from "zod"

import { FormDirtyHint, FormSheetSection } from "./form-sheet"
import { Textarea } from "./ui/textarea"

interface NotifierCardProps {
    data?: ModelNotification
    mutate: KeyedMutator<ModelNotification[]>
}

const notificationFormSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    request_method: z.coerce.number().int().min(1).max(255),
    request_type: z.coerce.number().int().min(1).max(255),
    request_header: z.string(),
    request_body: z.string(),
    verify_tls: asOptionalField(z.boolean()),
    skip_check: asOptionalField(z.boolean()),
    format_metric_units: asOptionalField(z.boolean()),
})

export const NotifierCard: React.FC<NotifierCardProps> = ({ data, mutate }) => {
    const { t } = useTranslation()
    type NotificationFormInput = z.input<typeof notificationFormSchema>
    type NotificationFormData = z.output<typeof notificationFormSchema>
    type NotificationDefaults = ModelNotification &
        Partial<Pick<NotificationFormData, "skip_check">>
    const notificationDefaults: NotificationDefaults | undefined = data

    const form = useForm<NotificationFormInput, unknown, NotificationFormData>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: data
            ? {
                  name: data.name ?? "",
                  url: data.url ?? "",
                  request_method: data.request_method ?? 1,
                  request_type: data.request_type ?? 1,
                  request_header: data.request_header ?? "",
                  request_body: data.request_body ?? "",
                  verify_tls: data.verify_tls ?? false,
                  skip_check: notificationDefaults?.skip_check ?? false,
                  format_metric_units: data.format_metric_units ?? false,
              }
            : {
                  name: "",
                  url: "",
                  request_method: 1,
                  request_type: 1,
                  request_header: "",
                  request_body: "",
                  verify_tls: false,
                  skip_check: false,
                  format_metric_units: false,
              },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    const [open, setOpen] = useState(false)

    const onSubmit = async (values: NotificationFormData) => {
        try {
            if (data?.id) {
                await updateNotification(data.id, values)
            } else {
                await createNotification(values)
            }
        } catch (e) {
            console.error(e)
            toast(t("Error"), {
                description: t("Results.UnExpectedError"),
            })
            return
        }
        setOpen(false)
        await mutate()
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {data ? <IconButton variant="outline" icon="edit" /> : <IconButton icon="plus" />}
            </DialogTrigger>
            <DialogContent variant="sheet" size="md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="fs-sheet-form">
                        <DialogHeader className="fs-sheet-head">
                            <DialogTitle>
                                {data ? t("EditNotifier") : t("CreateNotifier")}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="fs-sheet-body">
                            <FormSheetSection title={t("v2Forms.sections.basic")}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Name")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="My Notifier" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.webhook")}>
                                <FormField
                                    control={form.control}
                                    name="request_method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("RequestMethod")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={`${field.value}`}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Request Method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(nrequestMethods).map(
                                                        ([k, v]) => (
                                                            <SelectItem key={k} value={k}>
                                                                {v}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="request_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Type")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={`${field.value}`}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Request Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(nrequestTypes).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {v}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="request_header"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("RequestHeader")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y"
                                                    placeholder='{"User-Agent":"Nezha-Agent"}'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="request_body"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("RequestBody")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y h-[240px]"
                                                    placeholder='{&#13;&#10;  "content":"#NEZHA#",&#13;&#10;  "ServerName":"#SERVER.NAME#",&#13;&#10;  "ServerIP":"#SERVER.IP#",&#13;&#10;  "ServerIPV4":"#SERVER.IPV4#",&#13;&#10;  "ServerIPV6":"#SERVER.IPV6#",&#13;&#10;  "CPU":"#SERVER.CPU#",&#13;&#10;  "MEM":"#SERVER.MEM#",&#13;&#10;  "SWAP":"#SERVER.SWAP#",&#13;&#10;  "DISK":"#SERVER.DISK#",&#13;&#10;  "NetInSpeed":"#SERVER.NETINSPEED#",&#13;&#10;  "NetOutSpeed":"#SERVER.NETOUTSPEED#",&#13;&#10;  "TransferIn":"#SERVER.TRANSFERIN#",&#13;&#10;  "TranferOut":"#SERVER.TRANSFEROUT#",&#13;&#10;  "Load1":"#SERVER.LOAD1#",&#13;&#10;  "Load5":"#SERVER.LOAD5#",&#13;&#10;  "Load15":"#SERVER.LOAD15#",&#13;&#10;  "TCP_CONN_COUNT":"#SERVER.TCPCONNCOUNT",&#13;&#10;  "UDP_CONN_COUNT":"#SERVER.UDPCONNCOUNT"&#13;&#10;}'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.advanced")}>
                                <FormField
                                    control={form.control}
                                    name="verify_tls"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value === true}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">
                                                        {t("VerifyTLS")}
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skip_check"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value === true}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">
                                                        {t("DoNotSendTestMessage")}
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="format_metric_units"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value === true}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">
                                                        {t("FormatMetricUnits")}
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                        </div>
                        <DialogFooter className="fs-sheet-foot">
                            <FormDirtyHint />
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    {t("Close")}
                                </Button>
                            </DialogClose>
                            <Button type="submit">{t("Confirm")}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
