import { Oauth2RequestType, getOauth2RedirectURL } from "@/api/oauth2"
import { BrandMark, LanguageMenu, ThemeMenu } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { OAuthProviderIcon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import useSetting from "@/hooks/useSetting"
import { zodResolver } from "@hookform/resolvers/zod"
import i18next from "i18next"
import { AlertCircle, LoaderCircle } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string().min(2, { message: i18next.t("Results.UsernameMin", { number: 2 }) }),
    password: z.string().min(1, { message: i18next.t("Results.PasswordRequired") }),
})

function Login() {
    const { login, loginOauth2 } = useAuth()
    const { data: settingData } = useSetting()
    useEffect(() => {
        const oauth2 = new URLSearchParams(window.location.search).get("oauth2")
        if (oauth2) loginOauth2()
    }, [loginOauth2])
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // 等待原 hook 的 Promise，仅用于本表单 pending；不把初始 profile 探测当成登录状态。
        await login(values.username, values.password)
    }
    async function loginWith(provider: string) {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.LOGIN)
            window.location.assign(redirectUrl.redirect!)
        } catch (error: any) {
            toast.error(error.message)
        }
    }
    const { t } = useTranslation()
    const siteName = settingData?.config?.site_name || t("nezha")
    const formErrors = Object.values(form.formState.errors).map((error) => error.message).filter(Boolean)
    return (
        <div className="sh-login">
            <div className="sh-login-tools"><LanguageMenu /><ThemeMenu /></div>
            <section className="sh-login-brand" aria-label={siteName}>
                <BrandMark size={40} />
                <h2>{siteName}</h2>
                <p>{t("v2Shell.login.subtitle")}</p>
                <div className="sh-login-copyright num">&copy; 2019-{new Date().getFullYear()} {t("nezha")} {settingData?.version}</div>
            </section>
            <div className="sh-login-main">
                <div className="sh-login-card">
                    <div className="sh-login-mobile-brand"><BrandMark size={48} /><h2>{siteName}</h2><p>{t("v2Shell.login.subtitle")}</p></div>
                    <h1 className="sh-login-title">{t("v2Shell.login.title")}</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField control={form.control} name="username" render={({ field }) => (
                                <FormItem><FormLabel>{t("Username")}</FormLabel><FormControl><Input placeholder={t("Username")} autoComplete="username" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>{t("Password")}</FormLabel><FormControl><Input type="password" placeholder={t("Password")} autoComplete="current-password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            {formErrors.length > 0 && <div className="sh-login-error rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{formErrors.join(" · ")}</span></div>}
                            <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <LoaderCircle aria-hidden="true" className="animate-spin" />}{t("Login")}
                            </Button>
                        </form>
                    </Form>
                    {!!settingData?.config?.oauth2_providers?.length && <section className="mt-6 flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">OAuth2</span><Separator className="flex-1" /></section>}
                    <div className="sh-login-oauth">
                        {settingData?.config?.oauth2_providers?.map((provider: string) => <Button key={provider} variant="outline" onClick={() => loginWith(provider)}><OAuthProviderIcon provider={provider} className="size-4" />{provider}</Button>)}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Login
