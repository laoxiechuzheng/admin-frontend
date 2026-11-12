import { Oauth2RequestType, getOauth2RedirectURL } from "@/api/oauth2"
import { LanguageMenu, ThemeMenu } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { OAuthProviderIcon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import useSetting from "@/hooks/useSetting"
import { zodResolver } from "@hookform/resolvers/zod"
import i18next from "i18next"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string().min(2, {
        message: i18next.t("Results.UsernameMin", { number: 2 }),
    }),
    password: z.string().min(1, {
        message: i18next.t("Results.PasswordRequired"),
    }),
})

function Login() {
    const { login, loginOauth2 } = useAuth()
    const { data: settingData } = useSetting()

    useEffect(() => {
        const oauth2 = new URLSearchParams(window.location.search).get("oauth2")
        if (oauth2) {
            loginOauth2()
        }
    }, [loginOauth2])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        login(values.username, values.password)
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

    return (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
            <div className="absolute right-3 top-3 flex items-center gap-0.5 sm:right-5 sm:top-4">
                <LanguageMenu />
                <ThemeMenu />
            </div>
            <div className="w-full max-w-[360px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <img className="h-9 w-9" src="/dashboard/logo.svg" alt="" />
                    <h1 className="mt-4 text-xl font-semibold text-foreground">{siteName}</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        {t("Shell.SignInHint")}
                    </p>
                </div>
                <div className="rounded-xl border bg-card p-5 sm:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Username")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="admin"
                                                autoComplete="username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("Password")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="admin"
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-2 w-full">
                                {t("Login")}
                            </Button>
                        </form>
                        {settingData?.config?.oauth2_providers &&
                            settingData?.config?.oauth2_providers.length > 0 && (
                                <section className="flex items-center mt-5 mb-1 w-full">
                                    <Separator className="flex-1" />
                                    <div className="flex justify-center text-xs text-muted-foreground w-full max-w-[100px]">
                                        OAuth2
                                    </div>
                                    <Separator className="flex-1" />
                                </section>
                            )}
                    </Form>
                    <div className="mt-3 flex flex-col gap-2">
                        {settingData?.config?.oauth2_providers?.map((p: string) => (
                            <Button
                                key={p}
                                variant="outline"
                                className="w-full"
                                onClick={() => loginWith(p)}
                            >
                                <OAuthProviderIcon provider={p} className="size-4" />
                                {p}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
