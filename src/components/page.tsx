import { cn } from "@/lib/utils"
import { Inbox, LucideIcon } from "lucide-react"
import { HTMLAttributes, ReactNode, createContext, useContext } from "react"
import { useTranslation } from "react-i18next"

/** Page wrapper: consistent gutters and max width inside the app shell. */
export function Page({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[1400px] px-4 pb-10 pt-6 md:px-6 lg:px-8",
                className,
            )}
            {...props}
        />
    )
}

// 仅用 Context 标识页头动作区，不复制/遍历 Radix Trigger 的后代。
export const PageHeaderActionsContext = createContext(false)
export const usePageHeaderActions = () => useContext(PageHeaderActionsContext)

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
                "sh-page-header flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-[26px] tracking-[-.02em] text-foreground md:text-2xl md:leading-[30px]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 max-w-2xl line-clamp-2 text-[13px] text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="sh-page-header-actions flex shrink-0 flex-wrap items-center gap-2"><PageHeaderActionsContext.Provider value={true}>{actions}</PageHeaderActionsContext.Provider></div>}
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
                "sh-toolbar flex min-h-14 items-center justify-between gap-2 border-b px-5 py-2",
                !!selected && "bg-primary/[.08]",
                className,
            )}
            data-selected={!!selected}
        >
            {selected !== undefined && (
                <span
                    key={selected}
                    className={cn(
                        "sh-selection text-[13px] num",
                        selected > 0 ? "font-medium text-primary" : "text-muted-foreground",
                    )}
                >
                    {selected > 0
                        ? t("v2Shell.table.selectedPage", { count: selected })
                        : t("Shell.NoneSelected")}
                </span>
            )}
            <div className="sh-toolbar-controls">{children}</div>
        </div>
    )
}

/** Bordered surface that hosts toolbars and tables. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("surface overflow-hidden", className)} {...props} />
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
            <span className="sh-empty-icon">
                <Icon className="size-6" />
            </span>
            <p className="text-sm font-semibold text-foreground">{title ?? t("NoResults")}</p>
            {description && <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p>}
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
            className="chip whitespace-nowrap"
            data-tone={on ? "success" : "neutral"}
        >
            {on ? (onLabel ?? t("Shell.Yes")) : (offLabel ?? t("Shell.No"))}
        </span>
    )
}

/** Monospace cell for IDs, IPs, versions and commands. */
export function MonoCell({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn("font-mono text-xs num", className)}>{children}</span>
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
        <section className={cn("sh-form-section surface", className)}>
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
            <span className="text-[13px] font-semibold text-foreground">{children}</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
        </div>
    )
}
