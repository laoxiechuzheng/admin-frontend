import { updateSettings } from "@/api/settings"
import { FormSection, Page, PageHeader } from "@/components/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import {
    Form,
    FormControl,
    FormDescription,
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
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useNotification } from "@/hooks/useNotfication"
import useSetting from "@/hooks/useSetting"
import { asOptionalField, safeExternalHref } from "@/lib/utils"
import { nezhaLang, settingCoverageTypes } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

const settingFormSchema = z.object({
    dns_servers: asOptionalField(z.string()),
    ignored_ip_notification: asOptionalField(z.string()),
    ip_change_notification_group_id: z.coerce.number().int().min(0),
    cover: z.coerce.number().int().min(1),
    site_name: z.string().min(1),
    language: z.string().min(2),
    user_template: z.string().min(1),
    install_host: asOptionalField(z.string()),
    dashboard_host: asOptionalField(z.string()),
    reserved_hosts: asOptionalField(z.string()),
    custom_code: asOptionalField(z.string()),
    custom_code_dashboard: asOptionalField(z.string()),
    web_real_ip_header: asOptionalField(z.string()),
    agent_real_ip_header: asOptionalField(z.string()),

    tls: asOptionalField(z.boolean()),
    enable_ip_change_notification: asOptionalField(z.boolean()),
    enable_plain_ip_in_notification: asOptionalField(z.boolean()),
    enable_mcp: asOptionalField(z.boolean()),
})

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const { data: config, mutate } = useSetting()
    const { profile, loading: authLoading } = useAuth()

    const { notifierGroup } = useNotification()
    const ngroupList = notifierGroup?.map((ng) => ({
        value: `${ng.group.id}`,
        label: ng.group.name,
    })) || [{ value: "", label: "" }]

    const isAdmin = profile?.role === 0

    // 所有 hooks 必须在条件 return 之前调用，否则违反 rules-of-hooks。
    const form = useForm({
        resolver: zodResolver(settingFormSchema) as any,
        defaultValues: config
            ? {
                  ...config.config,
                  user_template:
                      config.config?.user_template ||
                      Object.keys(config.frontend_templates?.filter((t) => !t.is_admin) || {})[0] ||
                      "user-dist",
              }
            : {
                  ip_change_notification_group_id: 0,
                  cover: 1,
                  site_name: "",
                  language: "",
                  user_template: "user-dist",
              },
        resetOptions: {
            keepDefaultValues: false,
        },
    })

    useEffect(() => {
        if (config?.config) {
            form.reset(config?.config)
        }
    }, [config?.config, form])

    if (authLoading) {
        return null
    }
    if (!isAdmin) {
        return <Navigate to="/dashboard/settings/api-tokens" replace />
    }

    const onSubmit = async (values: any) => {
        try {
            await updateSettings(values)
            form.reset()
            await mutate()
        } catch (e) {
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: e?.toString(),
                }),
            })
            return
        }
        if (values.language != i18n.language) {
            i18n.changeLanguage(values.language)
        }
        toast(t("Success"))
    }

    return (
        <Page className="max-w-[960px]">
            <PageHeader title={t("Settings")} description={t("Shell.Desc.Settings")} />
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormSection
                            title={t("Shell.SettingsSection.Site")}
                            description={t("Shell.SettingsSection.SiteDesc")}
                        >
                            <FormField
                                control={form.control}
                                name="site_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("SiteName")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Language")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(nezhaLang).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>
                                                            {v}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="user_template"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Theme")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    const template =
                                                        config?.frontend_templates?.find(
                                                            (t) => t.path === value,
                                                        )
                                                    if (template) {
                                                        form.setValue(
                                                            "user_template",
                                                            template!.path!,
                                                        )
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-auto min-h-9 py-2">
                                                        <SelectValue
                                                            placeholder={t("SelectTheme")}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(
                                                        config?.frontend_templates?.filter(
                                                            (t) => !t.is_admin,
                                                        ) || []
                                                    ).map((template) => (
                                                        <div key={template.path}>
                                                            <SelectItem value={template.path!}>
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <div className="font-medium">
                                                                        {template.name}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <span>
                                                                            {t("Author")}:{" "}
                                                                            {template.author}
                                                                        </span>
                                                                        {!template.is_official ? (
                                                                            <span className="inline-flex h-5 items-center rounded-[4px] bg-warning/12 px-1.5 text-xs font-medium text-warning">
                                                                                {t("Community")}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex h-5 items-center rounded-[4px] bg-primary/12 px-1.5 text-xs font-medium text-primary">
                                                                                {t("Official")}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                            <div className="px-8 py-1">
                                                                {safeExternalHref(
                                                                    template.repository,
                                                                ) ? (
                                                                    <a
                                                                        href={safeExternalHref(
                                                                            template.repository,
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-primary hover:underline"
                                                                    >
                                                                        {template.repository}
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {template.repository}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                        {!config?.frontend_templates?.find(
                                            (t) => t.path === field.value,
                                        )?.is_official && (
                                            <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-[13px]">
                                                <div className="mb-1 font-medium text-warning">
                                                    {t("CommunityThemeWarning")}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {t("CommunityThemeDescription")}
                                                </div>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="custom_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("CustomCodes")}</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-y min-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="custom_code_dashboard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("CustomCodesDashboard")}</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-y min-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormSection>
                        <FormSection
                            title={t("Shell.SettingsSection.Network")}
                            description={t("Shell.SettingsSection.NetworkDesc")}
                        >
                            <FormField
                                control={form.control}
                                name="install_host"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("DashboardOriginalHost")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dashboard_host"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("DashboardHost")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>{t("DashboardHostHint")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reserved_hosts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("ReservedHosts")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>{t("ReservedHostsHint")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tls"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">{t("ConfigTLS")}</Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dns_servers"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("CustomPublicDNSNameserversforDDNS") +
                                                " " +
                                                t("SeparateWithComma")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="web_real_ip_header"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("WebRealIPHeader")}</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center">
                                                <Input
                                                    disabled={field.value == "NZ::Use-Peer-IP"}
                                                    className="w-1/2"
                                                    placeholder="CF-Connecting-IP"
                                                    {...field}
                                                />
                                                <Checkbox
                                                    checked={field.value == "NZ::Use-Peer-IP"}
                                                    className="ml-2"
                                                    onCheckedChange={(checked) => {
                                                        form.setValue(
                                                            "web_real_ip_header",
                                                            checked ? "NZ::Use-Peer-IP" : "",
                                                        )
                                                    }}
                                                />
                                                <FormLabel className="font-normal ml-2">
                                                    {t("UseDirectConnectingIP")}
                                                </FormLabel>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agent_real_ip_header"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("AgentRealIPHeader")}</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center">
                                                <Input
                                                    disabled={field.value == "NZ::Use-Peer-IP"}
                                                    className="w-1/2"
                                                    placeholder="CF-Connecting-IP"
                                                    {...field}
                                                />
                                                <Checkbox
                                                    checked={field.value == "NZ::Use-Peer-IP"}
                                                    className="ml-2"
                                                    onCheckedChange={(checked) => {
                                                        form.setValue(
                                                            "agent_real_ip_header",
                                                            checked ? "NZ::Use-Peer-IP" : "",
                                                        )
                                                    }}
                                                />
                                                <FormLabel className="font-normal ml-2">
                                                    {t("UseDirectConnectingIP")}
                                                </FormLabel>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormSection>
                        <FormSection
                            title={t("Shell.SettingsSection.Notify")}
                            description={t("Shell.SettingsSection.NotifyDesc")}
                        >
                            <FormItem>
                                <FormLabel>{t("IPChangeNotification")}</FormLabel>
                                <Card className="w-full bg-muted/30">
                                    <CardContent className="pt-5">
                                        <div className="flex flex-col space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="cover"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("Coverage")}</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={`${field.value}`}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {Object.entries(
                                                                    settingCoverageTypes,
                                                                ).map(([k, v]) => (
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
                                                name="ignored_ip_notification"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t("SpecificServers") +
                                                                " " +
                                                                t("SeparateWithComma")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="1,2,3" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ip_change_notification_group_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("NotifierGroup")}</FormLabel>
                                                        <FormControl>
                                                            <Combobox
                                                                placeholder={t("Search")}
                                                                options={ngroupList}
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value?.toString()}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="enable_ip_change_notification"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                                <Label className="text-sm">
                                                                    {t("Enable")}
                                                                </Label>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="enable_plain_ip_in_notification"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">
                                                    {t("FullIPNotification")}
                                                </Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormSection>
                        <FormSection
                            title={t("Shell.SettingsSection.Integration")}
                            description={t("Shell.SettingsSection.IntegrationDesc")}
                        >
                            <FormField
                                control={form.control}
                                name="enable_mcp"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label className="text-sm">{t("EnableMCP")}</Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormSection>
                        <div className="sticky bottom-0 z-10 -mx-1 flex justify-end border-t bg-background/95 px-1 py-3">
                            <Button type="submit">{t("Confirm")}</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Page>
    )
}
