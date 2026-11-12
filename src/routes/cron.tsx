import { swrFetcher } from "@/api/api"
import { deleteCron, runCron } from "@/api/cron"
import { ActionButtonGroup } from "@/components/action-button-group"
import { CopyButton } from "@/components/copy-button"
import { CronCard } from "@/components/cron"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { BoolCell, EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { IconButton } from "@/components/xui/icon-button"
import { selectableTableFeatures } from "@/lib/table"
import { ModelCron } from "@/types"
import { cronTypes } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { CalendarClock } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function CronPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelCron[]>("/api/v1/cron", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelCron>[] = [
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
            header: t("Type"),
            accessorKey: "taskType",
            accessorFn: (row) => cronTypes[row.task_type] || "",
        },
        {
            header: t("CronExpression"),
            accessorKey: "scheduler",
            accessorFn: (row) => row.scheduler,
        },
        {
            header: t("Command"),
            accessorKey: "command",
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.command} />
            },
        },
        {
            header: t("NotifierGroup"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("SendSuccessNotification"),
            accessorKey: "pushSuccessful",
            accessorFn: (row) => row.push_successful ?? false,
            cell: ({ row }) => <BoolCell value={row.original.push_successful} />,
        },
        {
            header: t("Coverage"),
            accessorKey: "cover",
            accessorFn: (row) => row.cover,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        {(() => {
                            switch (s.cover) {
                                case 0: {
                                    return <span>{t("IgnoreAll")}</span>
                                }
                                case 1: {
                                    return <span>{t("CoverAll")}</span>
                                }
                                case 2: {
                                    return <span>{t("OnAlert")}</span>
                                }
                            }
                        })()}
                    </div>
                )
            },
        },
        {
            header: t("SpecificServers"),
            accessorKey: "servers",
            accessorFn: (row) => row.servers,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-16 whitespace-normal break-words">
                        <span>{(s.servers || []).join(",")}</span>
                    </div>
                )
            },
        },
        {
            header: t("LastExecution"),
            accessorKey: "lastExecution",
            accessorFn: (row) => row.last_executed_at,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        {s.last_executed_at}
                    </div>
                )
            },
        },
        {
            header: t("Result"),
            accessorKey: "lastResult",
            accessorFn: (row) => row.last_result ?? false,
            cell: ({ row }) => (
                <BoolCell
                    value={row.original.last_result}
                    onLabel={t("Success")}
                    offLabel={t("Failure")}
                />
            ),
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteCron, id: s.id, mutate: mutate }}
                    >
                        <>
                            <IconButton
                                variant="outline"
                                icon="play"
                                onClick={async () => {
                                    try {
                                        await runCron(s.id)
                                    } catch (e) {
                                        console.error(e)
                                        toast(t("Error"), {
                                            description: t("Results.UnExpectedError"),
                                        })
                                        await mutate()
                                        return
                                    }
                                    toast(t("Success"), {
                                        description: t("Results.TaskTriggeredSuccessfully"),
                                    })
                                    await mutate()
                                }}
                            />
                            <CronCard mutate={mutate} data={s} />
                        </>
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
                title={t("Task")}
                description={t("Shell.Desc.Cron")}
                actions={<CronCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteCron,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={CalendarClock} />}
                />
            </Panel>
        </Page>
    )
}
