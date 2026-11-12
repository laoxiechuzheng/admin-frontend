import { swrFetcher } from "@/api/api"
import { deleteNotification } from "@/api/notification"
import { ActionButtonGroup } from "@/components/action-button-group"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { NotifierCard } from "@/components/notifier"
import { EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { useNotification } from "@/hooks/useNotfication"
import { selectableTableFeatures } from "@/lib/table"
import { ModelNotification } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Send } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function NotificationPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNotification[]>(
        "/api/v1/notification",
        swrFetcher,
    )
    const { notifierGroup } = useNotification()

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelNotification>[] = [
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
            header: t("Name"),
            accessorKey: "name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div
                        className="min-w-32 max-w-60 truncate font-medium text-foreground"
                        title={s.name}
                    >
                        {s.name}
                    </div>
                )
            },
        },
        {
            header: t("Group"),
            accessorKey: "groups",
            accessorFn: (row) => {
                return (
                    notifierGroup
                        ?.filter((ng) => ng.notifications?.includes(row.id))
                        .map((ng) => ng.group.id) || []
                )
            },
        },
        {
            header: "URL",
            accessorKey: "url",
            accessorFn: (row) => row.url,
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.url} />
            },
        },
        {
            header: t("VerifyTLS"),
            accessorKey: "verify_tls",
            accessorFn: (row) => row.verify_tls,
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
                            fn: deleteNotification,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <NotifierCard mutate={mutate} data={s} />
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
                title={t("Shell.Notifier")}
                description={t("Shell.Desc.Notifier")}
                actions={<NotifierCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteNotification,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={Send} />}
                />
            </Panel>
        </Page>
    )
}
