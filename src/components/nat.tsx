import { createNAT, updateNAT } from "@/api/nat"
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
import "@/styles/forms.css"
import { ModelNAT } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { KeyedMutator } from "swr"
import { z } from "zod"

import { FormDirtyHint, FormSheetSection } from "./form-sheet"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"

interface NATCardProps {
    data?: ModelNAT
    mutate: KeyedMutator<ModelNAT[]>
}

const natFormSchema = z.object({
    name: z.string().min(1),
    enabled: z.boolean(),
    server_id: z.coerce.number().int(),
    host: z.string(),
    domain: z.string(),
})

type NatFormInput = z.input<typeof natFormSchema>
type NatFormData = z.output<typeof natFormSchema>

export const NATCard: React.FC<NATCardProps> = ({ data, mutate }) => {
    const { t } = useTranslation()
    const form = useForm<NatFormInput, unknown, NatFormData>({
        resolver: zodResolver(natFormSchema),
        defaultValues: data
            ? {
                  name: data.name ?? "",
                  enabled: data.enabled ?? false,
                  server_id: data.server_id ?? 0,
                  host: data.host ?? "",
                  domain: data.domain ?? "",
              }
            : {
                  name: "",
                  enabled: false,
                  server_id: 0,
                  host: "",
                  domain: "",
              },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    const [open, setOpen] = useState(false)

    const onSubmit = async (values: NatFormData) => {
        try {
            if (data?.id) {
                await updateNAT(data.id, values)
            } else {
                await createNAT(values)
            }
        } catch (e: unknown) {
            console.error(e)
            toast(t("Error"), {
                description:
                    e instanceof Error && e.message ? e.message : t("Results.UnExpectedError"),
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
                            <DialogTitle>{data ? t("EditNAT") : t("CreateNAT")}</DialogTitle>
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
                                                <Input placeholder="My NAT Profile" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="server_id"
                                    render={({ field }) => {
                                        const { value, ...fieldProps } = field
                                        return (
                                            <FormItem>
                                                <FormLabel>{t("Server")} ID</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="1"
                                                        value={String(value ?? "")}
                                                        {...fieldProps}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.network")}>
                                <FormField
                                    control={form.control}
                                    name="host"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("LocalService")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="192.168.1.1:80 (with port)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="domain"
                                    render={({ field }) => (
                                        <FormItem className="fs-span-2">
                                            <FormLabel>{t("BindHostname")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="router.app.yourdomain.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enabled"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value === true}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">{t("Enable")}</Label>
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
