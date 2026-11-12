import { deleteAlertRules } from "@/api/alert-rule"
import { swrFetcher } from "@/api/api"
import { ActionButtonGroup } from "@/components/action-button-group"
import { AlertRuleCard } from "@/components/alert-rule"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { BoolCell, EmptyState, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { Checkbox } from "@/components/ui/checkbox"
import { selectableTableFeatures } from "@/lib/table"
import { ModelAlertRule, triggerModes } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { BellRing } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function AlertRulePage() {
    const { t } = useTranslation()

    const { data, mutate, error, isLoading } = useSWR<ModelAlertRule[]>(
        "/api/v1/alert-rule",
        swrFetcher,
    )

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", { error: error.message }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, ModelAlertRule>[] = [
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
                    <div className="max-w-56 whitespace-normal break-words font-medium text-foreground">
                        {s.name}
                    </div>
                )
            },
        },
        {
            header: t("NotifierGroup"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("TriggerMode"),
            accessorKey: "trigger Mode",
            accessorFn: (row) => triggerModes[row.trigger_mode] || "",
        },
        {
            header: t("Rules"),
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={JSON.stringify(s.rules)} />
            },
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
            header: t("Enable"),
            accessorKey: "enable",
            accessorFn: (row) => row.enable,
            cell: ({ row }) => <BoolCell value={row.original.enable} />,
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
                            fn: deleteAlertRules,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <AlertRuleCard mutate={mutate} data={s} />
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
                title={t("AlertRule")}
                description={t("Shell.Desc.AlertRule")}
                actions={<AlertRuleCard mutate={mutate} />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteAlertRules,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    />
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    empty={<EmptyState icon={BellRing} />}
                />
            </Panel>
        </Page>
    )
}
