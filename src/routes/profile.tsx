import { Oauth2RequestType, getOauth2RedirectURL, unbindOauth2 } from "@/api/oauth2"
import { getProfile } from "@/api/user"
import { EmptyState, Page, PageHeader } from "@/components/page"
import { ProfileCard } from "@/components/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OAuthProviderIcon } from "@/components/ui/icon"
import { useMainStore } from "@/hooks/useMainStore"
import { useServer } from "@/hooks/useServer"
import useSetting from "@/hooks/useSetting"
import { Boxes, Server } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function ProfilePage() {
    const { profile, setProfile } = useMainStore()
    const { servers, serverGroups } = useServer()
    const { data: settingData } = useSetting()
    const { t } = useTranslation()

    useEffect(() => {
        const oauth2 = new URLSearchParams(window.location.search).get("oauth2")
        if (oauth2) {
            getProfile().then((profile) => {
                setProfile(profile)
            })
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [setProfile])

    const bindO2 = async (provider: string) => {
        try {
            const redirectUrl = await getOauth2RedirectURL(provider, Oauth2RequestType.BIND)
            window.location.assign(redirectUrl.redirect!)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const unbindO2 = async (provider: string) => {
        try {
            await unbindOauth2(provider)
            const profile = await getProfile()
            setProfile(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const isAdmin = profile?.role === 0

    return (
        profile && (
            <Page className="max-w-[1100px]">
                <PageHeader title={t("Profile")} description={t("Shell.Desc.Profile")} />
                <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                    <section className="rounded-lg border bg-card p-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage
                                    src={
                                        "https://api.dicebear.com/7.x/notionists/svg?seed=" +
                                        profile.username
                                    }
                                    alt={profile.username}
                                />
                                <AvatarFallback>{profile.username}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold text-foreground">
                                    {profile.username}
                                </p>
                                <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1">
                                    {isAdmin ? t("Shell.Admin") : t("Shell.Member")}
                                </Badge>
                            </div>
                        </div>
                        <dl className="mt-5 space-y-2 border-t pt-4 text-[13px]">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">{t("Shell.LoginIP")}</dt>
                                <dd className="truncate font-mono text-xs tabular">
                                    {profile.login_ip || "Unknown"}
                                </dd>
                            </div>
                        </dl>
                        <ProfileCard className="mt-5 w-full" />
                    </section>
                    <div className="flex min-w-0 flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Server className="h-3.5 w-3.5" />
                                    {t("Server")}
                                </div>
                                <div className="mt-2 text-3xl font-semibold tabular text-foreground">
                                    {servers?.length || 0}
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Boxes className="h-3.5 w-3.5" />
                                    {t("Shell.ServerGroup")}
                                </div>
                                <div className="mt-2 text-3xl font-semibold tabular text-foreground">
                                    {serverGroups?.length || 0}
                                </div>
                            </div>
                        </div>
                        <section className="rounded-lg border bg-card">
                            <div className="border-b px-5 py-3.5">
                                <h2 className="text-sm font-semibold">
                                    {t("Shell.OAuth2Bindings")}
                                </h2>
                            </div>
                            {settingData?.config?.oauth2_providers?.length ? (
                                <ul className="divide-y">
                                    {settingData?.config?.oauth2_providers?.map((provider) => (
                                        <li
                                            key={provider}
                                            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                                        >
                                            <section className="flex items-center gap-2 text-[13px]">
                                                <OAuthProviderIcon
                                                    provider={provider}
                                                    className="size-4 text-muted-foreground"
                                                />
                                                <p className="font-medium">{provider}</p>
                                                {profile.oauth2_bind?.[provider.toLowerCase()] ? (
                                                    <Badge variant="success">
                                                        {
                                                            profile.oauth2_bind?.[
                                                                provider.toLowerCase()
                                                            ]
                                                        }
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="neutral">
                                                        {t("Shell.NotBound")}
                                                    </Badge>
                                                )}
                                            </section>
                                            {profile.oauth2_bind?.[provider.toLowerCase()] ? (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => unbindO2(provider)}
                                                >
                                                    {t("Shell.Unbind")}
                                                </Button>
                                            ) : (
                                                <Button size="sm" onClick={() => bindO2(provider)}>
                                                    {t("Shell.Bind")}
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState icon={Boxes} />
                            )}
                        </section>
                    </div>
                </div>
            </Page>
        )
    )
}
