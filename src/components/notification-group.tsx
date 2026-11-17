import { createNotificationGroup, updateNotificationGroup } from "@/api/notification-group"
import { Button } from "@/components/ui/button"
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
import { IconButton } from "@/components/xui/icon-button"
import { MultiSelect } from "@/components/xui/multi-select"
import { useNotification } from "@/hooks/useNotfication"
import "@/styles/forms.css"
import { ModelNotificationGroupResponseItem } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"
import { z } from "zod"

import { FormDirtyHint, FormSheetSection } from "./form-sheet"

interface NotificationGroupCardProps {
    data?: ModelNotificationGroupResponseItem
    mutate: KeyedMutator<ModelNotificationGroupResponseItem[]>
}

const notificationGroupFormSchema = z.object({
    name: z.string().min(1),
    notifications: z.array(z.number()),
})

export const NotificationGroupCard: React.FC<NotificationGroupCardProps> = ({ data, mutate }) => {
    const { t } = useTranslation()
    const form = useForm<z.infer<typeof notificationGroupFormSchema>>({
        resolver: zodResolver(notificationGroupFormSchema),
        defaultValues: data
            ? {
                  name: data.group.name,
                  notifications: data.notifications,
              }
            : {
                  name: "",
                  notifications: [],
              },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    const [open, setOpen] = useState(false)

    const onSubmit = async (values: z.infer<typeof notificationGroupFormSchema>) => {
        try {
            if (data?.group.id) {
                await updateNotificationGroup(data.group.id, values)
            } else {
                await createNotificationGroup(values)
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

    const { notifiers } = useNotification()
    const notifierList = notifiers?.map((n) => ({
        value: `${n.id}`,
        label: n.name,
    })) || [{ value: "", label: "" }]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {data ? <IconButton variant="outline" icon="edit" /> : <IconButton icon="plus" />}
            </DialogTrigger>
            <DialogContent variant="sheet" size="sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="fs-sheet-form">
                        <DialogHeader className="fs-sheet-head">
                            <DialogTitle>
                                {data ? t("EditNotifierGroup") : t("CreateNotifierGroup")}
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
                                                <Input placeholder="Group Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.members")}>
                                <FormField
                                    control={form.control}
                                    name="notifications"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("Notification")}</FormLabel>
                                            <MultiSelect
                                                options={notifierList}
                                                onValueChange={(e) => {
                                                    const arr = e.map(Number)
                                                    field.onChange(arr)
                                                }}
                                                defaultValue={field.value?.map(String)}
                                            />
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
