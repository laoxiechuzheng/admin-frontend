import { swrFetcher } from "@/api/api"
import { deleteService } from "@/api/service"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { BoolCell, EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { ServiceCard } from "@/components/service"
import { Checkbox } from "@/components/ui/checkbox"
import { selectableTableFeatures } from "@/lib/table"
import { ModelService as Service } from "@/types"
import { serviceTypes } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Activity } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function ServicePage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<Service[]>("/api/v1/service/list", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, Service>[] = [
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
            accessorFn: (row) => `${row.id}(${row.display_index ?? 0})`,
        },
        {
            header: t("Name"),
            accessorFn: (row) => row.name,
            accessorKey: "name",
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
            header: t("Target"),
            accessorFn: (row) => row.target,
            accessorKey: "target",
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div
                        className="max-w-64 truncate font-mono text-xs"
                        title={String(s.target ?? "")}
                    >
                        {s.target}
                    </div>
                )
            },
        },
        {
            header: t("Coverage"),
            accessorKey: "cover",
            accessorFn: (row) => row.cover,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 truncate">
                        {(() => {
                            switch (s.cover) {
                                case 0: {
                                    return <span>{t("CoverAll")}</span>
                                }
                                case 1: {
                                    return <span>{t("IgnoreAll")}</span>
                                }
                            }
                        })()}
                    </div>
                )
            },
        },
        {
            header: t("SpecificServers"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div
                        className="max-w-48 truncate"
                        title={Object.keys(s.skip_servers ?? {}).join(",")}
                    >
                        {Object.keys(s.skip_servers ?? {}).join(",")}
                    </div>
                )
            },
        },
        {
            header: t("Type"),
            accessorKey: "type",
            accessorFn: (row) => row.type,
            cell: ({ row }) => serviceTypes[row.original.type] || "",
        },
        {
            header: t("Interval"),
            accessorKey: "duration",
            accessorFn: (row) => row.duration,
        },
        {
            header: t("FailureThreshold"),
            accessorKey: "failure_threshold",
            accessorFn: (row) => row.failure_threshold,
        },
        {
            header: t("NotifierGroupID"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("Trigger"),
            accessorKey: "triggerTask",
            accessorFn: (row) => row.enable_trigger_task ?? false,
            cell: ({ row }) => <BoolCell value={row.original.enable_trigger_task} />,
        },
        {
            header: t("TasksToTriggerOnAlert"),
            accessorKey: "failTriggerTasks",
            accessorFn: (row) => row.fail_trigger_tasks,
        },
        {
            header: t("TasksToTriggerAfterRecovery"),
            accessorKey: "recoverTriggerTasks",
            accessorFn: (row) => row.recover_trigger_tasks,
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteService, id: s.id, mutate: mutate }}
                    >
                        <ServiceCard mutate={mutate} data={s} />
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
                title={t("Service")}
                description={t("Shell.Desc.Service")}
                actions={<ServiceCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteService,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={Activity} />}
                />
            </Panel>
        </Page>
    )
}
