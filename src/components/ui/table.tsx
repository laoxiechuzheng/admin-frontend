import { cn } from "@/lib/utils"
import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from "react"

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                role="table"
                className={cn("w-full caption-bottom text-[13px]", className)}
                {...props}
            />
        </div>
    ),
)
Table.displayName = "Table"

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead
            ref={ref}
            role="rowgroup"
            className={cn("bg-muted/40 [&_tr]:border-b [&_tr]:hover:bg-transparent", className)}
            {...props}
        />
    ),
)
TableHeader.displayName = "TableHeader"

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody ref={ref} role="rowgroup" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
    ),
)
TableBody.displayName = "TableBody"

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tfoot
            ref={ref}
            role="rowgroup"
            className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
            {...props}
        />
    ),
)
TableFooter.displayName = "TableFooter"

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            role="row"
            className={cn(
                "border-b transition-colors duration-150 hover:bg-muted/60 data-[state=selected]:bg-primary/[0.06]",
                className,
            )}
            {...props}
        />
    ),
)
TableRow.displayName = "TableRow"

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            role="columnheader"
            className={cn(
                "h-10 whitespace-nowrap px-3 text-left align-middle text-xs font-medium text-muted-foreground first:pl-4 last:pr-4",
                className,
            )}
            {...props}
        />
    ),
)
TableHead.displayName = "TableHead"

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td
            ref={ref}
            role="cell"
            className={cn(
                "h-11 px-3 py-2 align-middle first:pl-4 last:pr-4",
                className,
            )}
            {...props}
        />
    ),
)
TableCell.displayName = "TableCell"

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption
            ref={ref}
            className={cn("mt-4 text-sm text-muted-foreground", className)}
            {...props}
        />
    ),
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
