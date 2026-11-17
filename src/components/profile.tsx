import { getProfile, updateProfile } from "@/api/user"
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
import { useMainStore } from "@/hooks/useMainStore"
import { asOptionalField } from "@/lib/utils"
import "@/styles/forms.css"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"

import { FormDirtyHint, FormSheetSection } from "./form-sheet"

const profileFormSchema = z.object({
    original_password: z.string().min(5).max(72),
    new_password: z.string().min(8).max(72),
    new_username: z.string().min(1).max(32),
    reject_password: asOptionalField(z.boolean()),
})

export const ProfileCard = ({ className }: { className: string }) => {
    const { t } = useTranslation()
    const { profile, setProfile } = useMainStore()

    const form = useForm({
        resolver: zodResolver(profileFormSchema) as any,
        defaultValues: {
            original_password: "",
            new_password: "",
            new_username: profile?.username,
            reject_password: profile?.reject_password,
        },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    const [open, setOpen] = useState(false)

    const onSubmit = async (values: any) => {
        try {
            await updateProfile(values)
        } catch (e) {
            console.error(e)
            toast(t("Error"), {
                description: t("Results.UnExpectedError"),
            })
            return
        }
        const profile = await getProfile()
        setProfile(profile)
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={className}>
                    {t("UpdateProfile")}
                </Button>
            </DialogTrigger>
            <DialogContent variant="sheet" size="sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="fs-sheet-form">
                        <DialogHeader className="fs-sheet-head">
                            <DialogTitle>{t("UpdateProfile")}</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <div className="fs-sheet-body">
                            <FormSheetSection title={t("v2Forms.sections.account")}>
                                <FormField
                                    control={form.control}
                                    name="new_username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("NewUsername")}</FormLabel>
                                            <FormControl>
                                                <Input autoComplete="username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSheetSection>
                            <FormSheetSection title={t("v2Forms.sections.security")}>
                                <FormField
                                    control={form.control}
                                    name="original_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("OriginalPassword")}</FormLabel>
                                            <FormControl>
                                                <Input autoComplete="current-password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="new_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("NewPassword")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reject_password"
                                    render={({ field }) => (
                                        <FormItem className="fs-check flex items-center">
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label className="text-sm">
                                                        {t("RejectPassword")}
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
