import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useMainStore } from "@/hooks/useMainStore"
import useSetting from "@/hooks/useSetting"
import i18n from "@/lib/i18n"
import { InjectContext } from "@/lib/inject"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Outlet, useLocation } from "react-router-dom"

export default function Root() {
    const { t } = useTranslation()
    const { data: settingData, error } = useSetting()
    const { pathname } = useLocation()
    const profile = useMainStore((store) => store.profile)

    useEffect(() => {
        document.title = settingData?.config?.site_name || "哪吒监控 Nezha Monitoring"
    }, [settingData?.config?.site_name])

    useEffect(() => {
        if (settingData?.config?.custom_code_dashboard) {
            InjectContext(settingData?.config?.custom_code_dashboard)
        }
    }, [settingData?.config?.custom_code_dashboard])

    useEffect(() => {
        if (settingData?.config?.language && !localStorage.getItem("language")) {
            i18n.changeLanguage(settingData?.config?.language)
        }
    }, [settingData?.config?.language])

    if (error) {
        throw error
    }

    if (!settingData) {
        return null
    }

    const footer = (
        <footer className="px-4 py-5 text-center text-xs text-muted-foreground/70 tabular sm:px-6 lg:px-8">
            &copy; 2019-{new Date().getFullYear()} {t("nezha")} {settingData?.version}
        </footer>
    )

    // The login screen (and anything rendered before a profile exists) gets a
    // bare canvas; every authenticated page lives inside the Signal app shell.
    const bare = pathname === "/dashboard/login" || !profile

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            {bare ? (
                <div className="flex min-h-dvh flex-col">
                    <main className="flex flex-1 flex-col">
                        <Outlet />
                    </main>
                    {footer}
                </div>
            ) : (
                <AppShell footer={footer}>
                    <Outlet />
                </AppShell>
            )}
            <Toaster />
        </ThemeProvider>
    )
}
