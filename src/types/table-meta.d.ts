import type { CellData, RowData, TableFeatures } from "@tanstack/react-table"

// TanStack v9 的全局元数据扩充；不改变 table features 或数据契约。
declare module "@tanstack/react-table" {
    interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData = CellData> {
        mobile?: "title" | "meta" | "hide"
        label?: string
        span?: "full"
    }
}
