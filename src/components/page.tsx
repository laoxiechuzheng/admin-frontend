import { cn } from "@/lib/utils"
import { Inbox, LucideIcon } from "lucide-react"
import { HTMLAttributes, ReactNode } from "react"
import { useTranslation } from "react-i18next"

/** Page wrapper: consistent gutters and max width inside the app shell. */
export function Page({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8",
                className,
            )}
            {...props}
        />
    )
}

/** PageHeader: title + optional one-line description + right-aligned actions. */
export function PageHeader({
    title,
    description,
    actions,
    className,
}: {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}

/** Toolbar row above a table: selection summary on the left, controls on the right. */
export function Toolbar({
    selected,
    children,
    className,
}: {
    selected?: number
    children?: ReactNode
    className?: string
}) {
    const { t } = useTranslation()
    return (
        <div
            className={cn(
                "flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-4",
                className,
            )}
        >
            {selected !== undefined && (
                <span
                    className={cn(
                        "text-[13px] tabular",
                        selected > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                >
                    {selected > 0
                        ? t("Shell.SelectedCount", { count: selected })
                        : t("Shell.NoneSelected")}
                </span>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
        </div>
    )
}

/** Bordered surface that hosts toolbars and tables. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("overflow-hidden rounded-lg border bg-card", className)} {...props} />
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon
    title?: ReactNode
    description?: ReactNode
    action?: ReactNode
    className?: string
}) {
    const { t } = useTranslation()
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
                className,
            )}
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
            </span>
            <p className="text-[13px] font-medium text-foreground">{title ?? t("NoResults")}</p>
            {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}

/** Boolean table cell: status dot + Yes/No text, never colour alone. */
export function BoolCell({
    value,
    onLabel,
    offLabel,
}: {
    value: unknown
    onLabel?: ReactNode
    offLabel?: ReactNode
}) {
    const { t } = useTranslation()
    const on = !!value
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap",
                on ? "text-foreground" : "text-muted-foreground",
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    on ? "bg-success" : "bg-neutral-status/70",
                )}
            />
            {on ? (onLabel ?? t("Shell.Yes")) : (offLabel ?? t("Shell.No"))}
        </span>
    )
}

/** Monospace cell for IDs, IPs, versions and commands. */
export function MonoCell({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn("font-mono text-xs tabular", className)}>{children}</span>
}

/** Settings-style form section: titled card with a quiet header row. */
export function FormSection({
    title,
    description,
    children,
    className,
}: {
    title: ReactNode
    description?: ReactNode
    children: ReactNode
    className?: string
}) {
    return (
        <section className={cn("rounded-lg border bg-card", className)}>
            <div className="border-b px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="space-y-5 p-5">{children}</div>
        </section>
    )
}

/** Small heading that splits a long dialog form into sections. */
export function FieldGroupTitle({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-3 pt-3 first:pt-0">
            <span className="text-xs font-medium text-muted-foreground">{children}</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
        </div>
    )
}
