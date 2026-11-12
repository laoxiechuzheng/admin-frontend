import { swrFetcher } from "@/api/api"
import { deleteDDNSProfiles, getDDNSProviders } from "@/api/ddns"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { DDNSCard } from "@/components/ddns"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { BoolCell, EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { selectableTableFeatures } from "@/lib/table"
import { ModelDDNSProfile } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Globe } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function DDNSPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelDDNSProfile[]>(
        "/api/v1/ddns",
        swrFetcher,
    )
    const [providers, setProviders] = useState<string[]>([])

    useEffect(() => {
        const fetchProviders = async () => {
            const fetchedProviders = await getDDNSProviders()
            setProviders(fetchedProviders)
        }
        fetchProviders()
    }, [])

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelDDNSProfile>[] = [
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
            header: "IPv4",
            accessorKey: "enableIPv4",
            accessorFn: (row) => row.enable_ipv4 ?? false,
            cell: ({ row }) => <BoolCell value={row.original.enable_ipv4} />,
        },
        {
            header: "IPv6",
            accessorKey: "enableIPv6",
            accessorFn: (row) => row.enable_ipv6 ?? false,
            cell: ({ row }) => <BoolCell value={row.original.enable_ipv6} />,
        },
        {
            header: t("Provider"),
            accessorKey: "provider",
            accessorFn: (row) => row.provider,
        },
        {
            header: t("Domains"),
            accessorKey: "domains",
            accessorFn: (row) => row.domains,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div
                        className="max-w-64 truncate font-mono text-xs"
                        title={String(s.domains ?? "")}
                    >
                        {s.domains}
                    </div>
                )
            },
        },
        {
            header: t("MaximumRetryAttempts"),
            accessorKey: "maxRetries",
            accessorFn: (row) => row.max_retries,
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
                            fn: deleteDDNSProfiles,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <DDNSCard mutate={mutate} data={s} providers={providers} />
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
                title={t("DDNS")}
                description={t("Shell.Desc.DDNS")}
                actions={<DDNSCard mutate={mutate} providers={providers} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteDDNSProfiles,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={Globe} />}
                />
            </Panel>
        </Page>
    )
}
