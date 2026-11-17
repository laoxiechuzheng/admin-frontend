import { createCron, updateCron } from "@/api/cron"
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
import { useNotification } from "@/hooks/useNotfication"
import { useServer } from "@/hooks/useServer"
import { asOptionalField } from "@/lib/utils"
import "@/styles/forms.css"
import { ModelCron } from "@/types"
import { cronCoverageTypes, cronTypes } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"
import { z } from "zod"

import { FormDirtyHint, FormSheetSection } from "./form-sheet"
import { Combobox } from "./ui/combobox"
import { Textarea } from "./ui/textarea"
import { MultiSelect } from "./xui/multi-select"

interface CronCardProps {
    data?: ModelCron
    mutate: KeyedMutator<ModelCron[]>
}

const cronFormSchema = z.object({
    task_type: z.coerce.number(),
    name: z.string().min(1),
    scheduler: z.string(),
    command: asOptionalField(z.string()),
    servers: z.array(z.number()),
    cover: z.coerce.number().int(),
    push_successful: asOptionalField(z.boolean()),
    notification_group_id: z.coerce.number().int(),
})

type CronFormInput = z.input<typeof cronFormSchema>
type CronFormData = z.output<typeof cronFormSchema>

export const CronCard: React.FC<CronCardProps> = ({ data, mutate }) => {
    const { t } = useTranslation()
    const form = useForm<CronFormInput, unknown, CronFormData>({
        resolver: zodResolver(cronFormSchema),
        defaultValues: data
            ? {
                  task_type: data.task_type ?? 0,
                  name: data.name ?? "",
                  scheduler: data.scheduler ?? "",
                  command: data.command ?? "",
                  servers: data.servers ?? [],
                  cover: data.cover ?? 0,
                  push_successful: data.push_successful ?? false,
                  notification_group_id: data.notification_group_id ?? 0,
              }
            : {
                  task_type: 0,
                  name: "",
                  scheduler: "",
                  command: "",
                  servers: [],
                  cover: 0,
                  push_successful: false,
                  notification_group_id: 0,
              },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    const [open, setOpen] = useState(false)

    const onSubmit = async (values: CronFormData) => {
        try {
            if (data?.id) {
                await updateCron(data.id, values)
            } else {
                await createCron(values)
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

    const { servers } = useServer()
    const serverList = servers?.map((s) => ({
        value: `${s.id}`,
        label: s.name,
    })) || [{ value: "", label: "" }]

    const { notifierGroup } = useNotification()
    const ngroupList = notifierGroup?.map((ng) => ({
        value: `${ng.group.id}`,
        label: ng.group.name,
    })) || [{ value: "", label: "" }]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {data ? <IconButton variant="outline" icon="edit" /> : <IconButton icon="plus" />}
            </DialogTrigger>
            <DialogContent variant="sheet" size="lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="fs-sheet-form">
                        <DialogHeader className="fs-sheet-head">
                            <DialogTitle>{data ? t("EditTask") : t("CreateTask")}</DialogTitle>
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
                                                <Input placeholder="My Task" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="task_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Type")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={`${field.value}`}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select task type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(cronTypes).map(([k, v]) => (
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
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.execution")}>
                                <FormField
                                    control={form.control}
                                    name="scheduler"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("CronExpression")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0 0 3 * * * (At 3 AM)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="command"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("Command")}</FormLabel>
                                            <FormControl>
                                                <Textarea className="resize-y" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.coverage")}>
                                <FormField
                                    control={form.control}
                                    name="cover"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("Coverage")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={`${field.value}`}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(cronCoverageTypes).map(
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
                                    name="servers"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("SpecificServers")}</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={serverList}
                                                    onValueChange={(e) => {
                                                        const arr = e.map(Number)
                                                        field.onChange(arr)
                                                    }}
                                                    defaultValue={field.value?.map(String)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.notify")}>
                                <FormField
                                    control={form.control}
                                    name="notification_group_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("NotifierGroup")}</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    placeholder="Search..."
                                                    options={ngroupList}
                                                    onValueChange={field.onChange}
                                                    defaultValue={String(field.value ?? "")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="push_successful"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value === true}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">
                                                        {t("PushSuccessful")}
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
