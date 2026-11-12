import { swrFetcher } from "@/api/api"
import { deleteUser } from "@/api/user"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCard } from "@/components/user"
import { selectableTableFeatures } from "@/lib/table"
import { ModelUser } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Users } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function UserPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelUser[]>("/api/v1/user", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.UnExpectedError", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelUser>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableHiding: false,
        },
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("Username"),
            accessorKey: "username",
            accessorFn: (row) => row.username,
        },
        {
            header: t("Role"),
            accessorKey: "role",
            accessorFn: (row) => {
                return row.role === 1 ? t("User") : t("Admin")
            },
        },
        {
            header: t("LastLogin"),
            accessorKey: "updated_at",
            accessorFn: (row) =>
                row.updated_at ? new Date(row.updated_at).toLocaleString() : t("Never"),
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{
                            fn: deleteUser,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </ActionButtonGroup>
                )
            },
        },
    ]

    const dataCache = useMemo(() => {
        return data ?? []
    }, [data])

    const table = useTable({
        features: selectableTableFeatures,
        data: dataCache,
        columns,
    })

    const selectedRows = table.getSelectedRowModel().rows

    return (
        <Page>
            <PageHeader
                title={t("User")}
                description={t("Shell.Desc.User")}
                actions={<UserCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteUser,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={Users} />}
                />
            </Panel>
        </Page>
    )
}
