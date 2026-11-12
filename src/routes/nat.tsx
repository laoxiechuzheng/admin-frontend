import { swrFetcher } from "@/api/api"
import { deleteNAT } from "@/api/nat"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { NATCard } from "@/components/nat"
import { BoolCell, EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { selectableTableFeatures } from "@/lib/table"
import { ModelNAT } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Network } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function NATPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNAT[]>("/api/v1/nat", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelNAT>[] = [
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
            header: t("Enabled"),
            accessorKey: "enabled",
            accessorFn: (row) => row.enabled,
            cell: ({ row }) => <BoolCell value={row.original.enabled} />,
        },
        {
            header: t("Name"),
            accessorKey: "name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-56 whitespace-normal break-words font-medium text-foreground">
                        {s.name}
                    </div>
                )
            },
        },
        {
            header: t("Server") + " ID",
            accessorKey: "serverID",
            accessorFn: (row) => row.server_id,
        },
        {
            header: t("LocalService"),
            accessorKey: "host",
            accessorFn: (row) => row.host,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-64 whitespace-normal break-all font-mono text-xs">
                        {s.host}
                    </div>
                )
            },
        },
        {
            header: t("BindHostname"),
            accessorKey: "domain",
            accessorFn: (row) => row.domain,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-64 whitespace-normal break-all font-mono text-xs">
                        {s.domain}
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
                        delete={{ fn: deleteNAT, id: s.id, mutate: mutate }}
                    >
                        <NATCard mutate={mutate} data={s} />
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
                title={t("NATT")}
                description={t("Shell.Desc.NAT")}
                actions={<NATCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteNAT,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={Network} />}
                />
            </Panel>
        </Page>
    )
}
