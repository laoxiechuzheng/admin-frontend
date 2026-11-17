import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useRouteError } from "react-router-dom"

interface RouterError { statusText?: string; message?: string; status?: number }
export default function ErrorPage() {
    const error = useRouteError() as RouterError
    const navigate = useNavigate()
    const { t } = useTranslation()
    console.error(error)
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <section className="surface w-full max-w-md border-danger/30 bg-danger/10 p-6 text-center">
                <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-[14px] bg-danger/12 text-danger"><AlertCircle className="size-6" /></span>
                <h1 className="text-xl font-semibold">{t("v2Shell.error.title")}</h1>
                <p className="mt-2 text-[13px] text-muted-foreground">{t("v2Shell.error.description")}</p>
                <p className="my-5 break-words rounded-xl border border-danger/30 bg-card p-3 font-mono text-xs text-danger">{error.statusText || error.message}</p>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>{t("v2Shell.error.back")}</Button>
            </section>
        </div>
    )
}
