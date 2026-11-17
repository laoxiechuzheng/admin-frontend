import { EmptyState } from "@/components/page"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"
import { ReactNode } from "react"

interface PresentationColumn {
    id: string
    columnDef: {
        header?: unknown
        cell?: unknown
        meta?: { mobile?: "title" | "meta" | "hide"; label?: string; span?: "full" }
    }
}

// 只读取展示所需的结构，不要求调用方注册额外 table feature。
interface TableLike {
    getHeaderGroups: () => {
        id: string
        headers: {
            id: string
            isPlaceholder: boolean
            column: PresentationColumn
            getContext: () => unknown
        }[]
    }[]
    getRowModel: () => {
        rows: {
            id: string
            getIsSelected?: () => boolean
            getVisibleCells: () => {
                id: string
                column: PresentationColumn
                getContext: () => unknown
            }[]
        }[]
    }
}

export function DataTable({ table, columnCount, isLoading, empty, minWidth, className }: {
    table: TableLike
    columnCount: number
    isLoading?: boolean
    empty?: ReactNode
    minWidth?: number
    className?: string
}) {
    const rows = table.getRowModel().rows
    const headerGroups = table.getHeaderGroups()
    const visibleColumns = rows[0]?.getVisibleCells().map((cell) => cell.column)
        ?? headerGroups.flatMap((group) => group.headers.filter((header) => !header.isPlaceholder).map((header) => header.column))
    const dataColumns = visibleColumns.filter((column) => column.id !== "select" && column.id !== "actions")
    const titleId = (dataColumns.find((column) => column.columnDef.meta?.mobile === "title")
        ?? dataColumns.find((column) => column.columnDef.meta?.mobile !== "hide"))?.id
    const mobileType = (column: PresentationColumn) => {
        if (column.id === "select" || column.id === "actions") return column.id
        if (column.id === titleId) return "title"
        return column.columnDef.meta?.mobile === "hide" ? "hide" : "meta"
    }
    const label = (column: PresentationColumn) => column.columnDef.meta?.label
        ?? (typeof column.columnDef.header === "string" ? column.columnDef.header : undefined)
    const cellClass = (column: PresentationColumn) => cn(
        "sh-table-cell whitespace-nowrap",
        column.id === "actions" && "sh-table-actions",
        column.id === titleId && "sh-table-title",
    )

    return (
        <div className={className}>
            <Table
                role="table"
                data-responsive="cards"
                data-density={rows.length > 200 ? "high" : "normal"}
                style={minWidth ? { minWidth } : undefined}
            >
                <TableHeader role="rowgroup">
                    {headerGroups.map((group) => (
                        <TableRow key={group.id} role="row">
                            {group.headers.map((header) => (
                                <TableHead key={header.id} role="columnheader" className={cellClass(header.column)} data-column={header.column.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header as never, header.getContext() as never)}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody role="rowgroup">
                    {isLoading ? Array.from({ length: 3 }, (_, index) => (
                        <TableRow key={`sk-${index}`} role="row" className="sh-table-placeholder">
                            <TableCell role="cell" colSpan={columnCount}><Skeleton className="h-4 w-full max-w-[60%]" /></TableCell>
                        </TableRow>
                    )) : rows.length ? rows.map((row) => {
                        const cells = row.getVisibleCells()
                        return (
                            <TableRow key={row.id} role="row" className="group" data-state={row.getIsSelected?.() ? "selected" : undefined} data-has-select={cells.some((cell) => cell.column.id === "select") || undefined}>
                                {cells.map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        role="cell"
                                        className={cellClass(cell.column)}
                                        data-mobile={mobileType(cell.column)}
                                        data-label={cell.column.id === "select" || cell.column.id === "actions" ? undefined : label(cell.column)}
                                        data-span={cell.column.columnDef.meta?.span}
                                        data-column={cell.column.id}
                                    >
                                        {flexRender(cell.column.columnDef.cell as never, cell.getContext() as never)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    }) : (
                        <TableRow role="row" className="sh-table-placeholder">
                            <TableCell role="cell" colSpan={columnCount} className="p-0">{empty ?? <EmptyState />}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
