import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { selectableTableFeatures } from "@/lib/table"
import { ColumnDef, RowData } from "@tanstack/react-table"
import { AlertCircle, RotateCw } from "lucide-react"
import { useTranslation } from "react-i18next"

/** 只补呈现元数据，不变更 accessor、选择状态、数据源或原有单元格。 */
export function mobileColumns<T extends RowData>(
    columns: ColumnDef<typeof selectableTableFeatures, T>[],
    title: string,
    full: string[] = [],
): ColumnDef<typeof selectableTableFeatures, T>[] {
    return columns.map((column) => {
        const id = column.id ?? ("accessorKey" in column ? column.accessorKey : undefined)
        if (id === "select" || id === "actions") return column
        const label = typeof column.header === "string" ? column.header : undefined
        return {
            ...column,
            ...(!column.cell
                ? {
                      cell: ({ getValue }) => {
                          const value = getValue()
                          if (id === "id")
                              return (
                                  <span className="pg-id">
                                      {typeof value === "string" || typeof value === "number"
                                          ? value
                                          : ""}
                                  </span>
                              )
                          if (typeof value === "number")
                              return <span className="pg-number num">{value}</span>
                          if (Array.isArray(value))
                              return (
                                  <span className="font-mono text-xs num">{value.join(",")}</span>
                              )
                          const text = typeof value === "string" ? value : ""
                          return (
                              <span className="pg-cell-text" title={text}>
                                  {text}
                              </span>
                          )
                      },
                  }
                : {}),
            meta: {
                mobile: id === title ? "title" : "meta",
                ...(label ? { label } : {}),
                ...(full.includes((typeof id === "string" ? id : label) ?? "")
                    ? { span: "full" as const }
                    : {}),
                ...column.meta,
            },
        }
    })
}

/** 页面错误保留已有数据；重试仍调用各页原来的 SWR mutate。 */
export function PageErrorNotice({ retry }: { retry: () => unknown }) {
    const { t } = useTranslation()
    return (
        <div className="pg-error" role="alert">
            <span className="pg-error-icon" aria-hidden="true">
                <AlertCircle />
            </span>
            <div className="min-w-0 flex-1">
                <p className="font-semibold">{t("v2Pages.error.title")}</p>
                <p className="text-xs text-muted-foreground">{t("v2Pages.error.description")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => retry()}>
                <RotateCw aria-hidden="true" />
                {t("v2Pages.error.retry")}
            </Button>
        </div>
    )
}

/** 值和既有复制动作同时保留，手机上不依赖 hover 或 title 才能读到。 */
export function CopyValue({ value }: { value?: string }) {
    return (
        <div className="pg-copy-value">
            <code className="pg-copy-text" title={value}>
                {value || "—"}
            </code>
            <CopyButton text={value} />
        </div>
    )
}
