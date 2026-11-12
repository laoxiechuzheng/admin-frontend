import { swrFetcher } from "@/api/api"
import { deleteServer, forceUpdateServer } from "@/api/server"
import { ActionButtonGroup } from "@/components/action-button-group"
import { BatchMoveServerIcon } from "@/components/batch-move-server-icon"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { InstallCommandsMenu } from "@/components/install-commands"
import { NoteMenu } from "@/components/note-menu"
import { BoolCell, EmptyState, MonoCell, Page, PageHeader, Panel, Toolbar } from "@/components/page"
import { ServerCard } from "@/components/server"
import { ServerConfigCard } from "@/components/server-config"
import { ServerConfigCardBatch } from "@/components/server-config-batch"
import { TerminalButton } from "@/components/terminal"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconButton } from "@/components/xui/icon-button"
import { useServer } from "@/hooks/useServer"
import { selectableTableFeatures } from "@/lib/table"
import { joinIP } from "@/lib/utils"
import { ModelServerTaskResponse, ModelServer as Server } from "@/types"
import { ColumnDef, useTable } from "@tanstack/react-table"
import { Server as ServerIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function ServerPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<Server[]>("/api/v1/server", swrFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    const { serverGroups } = useServer()

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", { error: error.message }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<typeof selectableTableFeatures, Server>[] = [
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
            accessorFn: (row) => `${row.id}(${row.display_index})`,
            cell: ({ row }) => (
                <MonoCell className="text-muted-foreground">
                    {row.original.id}
                    <span className="text-muted-foreground/60">({row.original.display_index})</span>
                </MonoCell>
            ),
        },
        {
            header: t("Name"),
            accessorKey: "name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-40 whitespace-normal break-words font-medium text-foreground">
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
                    serverGroups
                        ?.filter((sg) => sg.servers?.includes(row.id))
                        .map((sg) => sg.group.id) || []
                )
            },
            cell: ({ row }) => {
                const groups =
                    serverGroups?.filter((sg) => sg.servers?.includes(row.original.id)) || []
                if (!groups.length) return <span className="text-muted-foreground">-</span>
                return (
                    <div className="flex max-w-48 flex-wrap gap-1">
                        {groups.map((sg) => (
                            <Badge key={sg.group.id} variant="secondary" title={`#${sg.group.id}`}>
                                {sg.group.name}
                            </Badge>
                        ))}
                    </div>
                )
            },
        },
        {
            id: "owner",
            header: t("Owner"),
            // Backend Server.MarshalJSON always emits owner.id; username is
            // omitted for uid=0 (legacy global agent secret) and for users
            // that no longer exist. Render uid=0 as "Global Agent" and a
            // missing username as "Unknown user (#id)" so deleted-user rows
            // stay debuggable instead of silently appearing ownerless.
            accessorFn: (row) => {
                if (!row.owner) return ""
                if (row.owner.id === 0) return t("GlobalAgent")
                return row.owner.username || t("UnknownUser", { id: row.owner.id })
            },
            cell: ({ row }) => {
                const owner = row.original.owner
                if (!owner) {
                    return <span className="text-muted-foreground">-</span>
                }
                if (owner.id === 0) {
                    return <span>{t("GlobalAgent")}</span>
                }
                const label = owner.username || t("UnknownUser", { id: owner.id })
                return (
                    <div
                        className="max-w-48 whitespace-normal break-words"
                        title={`uid=${owner.id}`}
                    >
                        {label}
                    </div>
                )
            },
        },
        {
            id: "ip",
            header: "IP",
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-40 whitespace-normal break-words font-mono text-xs tabular">
                        {joinIP(s.geoip?.ip)}
                    </div>
                )
            },
        },
        {
            header: t("Version"),
            accessorKey: "host.version",
            accessorFn: (row) => row.host.version || t("Unknown"),
            cell: ({ row }) =>
                row.original.host.version ? (
                    <MonoCell>{row.original.host.version}</MonoCell>
                ) : (
                    <span className="text-muted-foreground">{t("Unknown")}</span>
                ),
        },
        {
            header: t("EnableDDNS"),
            accessorKey: "enableDDNS",
            accessorFn: (row) => row.enable_ddns ?? false,
            cell: ({ row }) => <BoolCell value={row.original.enable_ddns} />,
        },
        {
            header: t("HideForGuest"),
            accessorKey: "hideForGuest",
            accessorFn: (row) => row.hide_for_guest ?? false,
            cell: ({ row }) => <BoolCell value={row.original.hide_for_guest} />,
        },
        {
            id: "note",
            header: t("Note"),
            cell: ({ row }) => {
                const s = row.original
                return <NoteMenu note={{ private: s.note, public: s.public_note }} />
            },
        },
        {
            id: "uuid",
            header: "UUID",
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.uuid} />
            },
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex items-center gap-1.5"
                        delete={{ fn: deleteServer, id: s.id, mutate: mutate }}
                    >
                        <>
                            <ServerCard mutate={mutate} data={s} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        icon="more"
                                        variant="outline"
                                        aria-label="More actions"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <TerminalButton id={s.id} menuItem />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <ServerConfigCard sid={s.id} variant="ghost" menuItem />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <InstallCommandsMenu uuid={s.uuid} menuItem />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                title={t("Server")}
                description={t("Shell.Desc.Server")}
                actions={<InstallCommandsMenu />}
            />
            <Panel>
                <Toolbar selected={selectedRows.length}>
                    <HeaderButtonGroup
                        className="flex flex-wrap items-center gap-2"
                        delete={{
                            fn: deleteServer,
                            id: selectedRows.map((r) => r.original.id),
                            mutate: mutate,
                        }}
                    >
                        <IconButton
                            icon="update"
                            title={t("Shell.ForceUpdate")}
                            aria-label={t("Shell.ForceUpdate")}
                            onClick={async () => {
                                const id = selectedRows.map((r) => r.original.id)
                                if (id.length < 1) {
                                    toast(t("Error"), {
                                        description: t("Results.SelectAtLeastOneServer"),
                                    })
                                    return
                                }

                                let resp: ModelServerTaskResponse = {}
                                try {
                                    resp = await forceUpdateServer(id)
                                } catch (e) {
                                    console.error(e)
                                    toast(t("Error"), {
                                        description: t("Results.UnExpectedError"),
                                    })
                                    return
                                }
                                toast(t("Done"), {
                                    description:
                                        t("Results.ForceUpdate") +
                                        (resp.success?.length
                                            ? t(`Success`) + ` [${resp.success.join(",")}]`
                                            : "") +
                                        (resp.failure?.length
                                            ? t(`Failure`) + ` [${resp.failure.join(",")}]`
                                            : "") +
                                        (resp.offline?.length
                                            ? t(`Offline`) + ` [${resp.offline.join(",")}]`
                                            : ""),
                                })
                            }}
                        />
                        <BatchMoveServerIcon
                            serverIds={selectedRows.map((r) => r.original.id)}
                            title={t("BatchMoveServer")}
                            aria-label={t("BatchMoveServer")}
                        />
                        <ServerConfigCardBatch
                            sid={selectedRows.map((r) => r.original.id)}
                            title={t("EditServerConfig")}
                            aria-label={t("EditServerConfig")}
                        />
                    </HeaderButtonGroup>
                </Toolbar>
                <DataTable
                    table={table}
                    columnCount={columns.length}
                    isLoading={isLoading}
                    minWidth={1040}
                    empty={<EmptyState icon={ServerIcon} />}
                />
            </Panel>
        </Page>
    )
}
