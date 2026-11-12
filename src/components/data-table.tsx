import { EmptyState } from "@/components/page"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"
import { ReactNode } from "react"

// Minimal structural view of a TanStack table instance, so DataTable stays
// agnostic of the feature set each page registers.
interface TableLike {
    getHeaderGroups: () => {
        id: string
        headers: {
            id: string
            isPlaceholder: boolean
            column: { id: string; columnDef: { header?: unknown } }
            getContext: () => unknown
        }[]
    }[]
    getRowModel: () => {
        rows: {
            id: string
            getIsSelected?: () => boolean
            getVisibleCells: () => {
                id: string
                column: { id: string; columnDef: { cell?: unknown } }
                getContext: () => unknown
            }[]
        }[]
    }
}

/**
 * DataTable renders the shared Signal table pattern (sticky header, 44px rows,
 * skeleton loading, quiet empty state) for a TanStack table instance. It only
 * changes presentation; columns and row models stay owned by each page.
 */
export function DataTable({
    table,
    columnCount,
    isLoading,
    empty,
    minWidth,
    className,
}: {
    table: TableLike
    columnCount: number
    isLoading?: boolean
    empty?: ReactNode
    minWidth?: number
    className?: string
}) {
    const rows = table.getRowModel().rows
    // The actions column stays pinned to the right edge while wide tables
    // scroll horizontally inside their panel.
    const pinned = (id: string) => id === "actions"
    return (
        <div className={className}>
            <Table style={minWidth ? { minWidth } : undefined}>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        pinned(header.column.id) &&
                                            "md:sticky md:right-0 md:z-[1] bg-card md:shadow-[inset_1px_0_0_hsl(var(--border))] [background-image:linear-gradient(hsl(var(--muted)/0.4),hsl(var(--muted)/0.4))]",
                                    )}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header as never,
                                              header.getContext() as never,
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={`sk-${i}`} className="hover:bg-transparent">
                                <TableCell colSpan={columnCount}>
                                    <Skeleton className="h-4 w-full max-w-[60%]" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : rows.length ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="group hover:bg-muted"
                                data-state={row.getIsSelected?.() ? "selected" : undefined}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            "whitespace-nowrap",
                                            pinned(cell.column.id) &&
                                                "md:sticky md:right-0 md:z-[1] bg-card md:shadow-[inset_1px_0_0_hsl(var(--border))] transition-colors duration-150 group-hover:bg-muted",
                                        )}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell as never,
                                            cell.getContext() as never,
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columnCount} className="p-0">
                                {empty ?? <EmptyState />}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
