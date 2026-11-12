import { swrFetcher } from "@/api/api"
import { deleteNotificationGroups } from "@/api/notification-group"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { NotificationGroupCard } from "@/components/notification-group"
import { EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { selectableTableFeatures } from "@/lib/table"
import { ModelNotificationGroupResponseItem } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { UsersRound } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

type NotificationGroupColumn = ColumnDef<
    typeof selectableTableFeatures,
    ModelNotificationGroupResponseItem
>

export default function NotificationGroupPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNotificationGroupResponseItem[]>(
        "/api/v1/notification-group",
        swrFetcher,
    )

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: NotificationGroupColumn[] = [
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
            accessorFn: (row) => row.group.id,
        },
        {
            header: t("Name"),
            accessorKey: "name",
            accessorFn: (row) => row.group.name,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 truncate" title={s.group.name}>
                        {s.group.name}
                    </div>
                )
            },
        },
        {
            header: t("Notifier") + "(ID)",
            accessorKey: "notifications",
            accessorFn: (row) => row.notifications,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 truncate" title={(s.notifications || []).join(",")}>
                        <span>{(s.notifications || []).join(",")}</span>
                    </div>
                )
            },
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
                            fn: deleteNotificationGroups,
                            id: s.group.id,
                            mutate: mutate,
                        }}
                    >
                        <NotificationGroupCard mutate={mutate} data={s} />
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
                title={t("Shell.NotificationGroup")}
                description={t("Shell.Desc.NotificationGroup")}
                actions={<NotificationGroupCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteNotificationGroups,
                            id: selectedRows.map((r) => r.original.group.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={UsersRound} />}
                />
            </Panel>
        </Page>
    )
}
