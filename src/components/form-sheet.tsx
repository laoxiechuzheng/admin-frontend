import { FieldGroupTitle } from "@/components/page"
import "@/styles/forms.css"
import { ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

export function FormSheetSection({ title, children }: { title: ReactNode; children: ReactNode }) {
    return (
        <section className="fs-section">
            <FieldGroupTitle>{title}</FieldGroupTitle>
            <div className="fs-grid">{children}</div>
        </section>
    )
}

export function FormDirtyHint() {
    const { formState } = useFormContext()
    const { t } = useTranslation()
    if (!formState.isDirty) return null

    return (
        <span className="fs-dirty" role="status">
            <span aria-hidden="true" />
            {t("v2Forms.unsaved")}
        </span>
    )
}
