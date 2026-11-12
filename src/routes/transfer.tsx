import { swrFetcher } from "@/api/api"
import { cancelServerTransfer, retryServerTransfer } from "@/api/transfer"
import { EmptyState, Page, PageHeader, Panel } from "@/components/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import {
    ModelServerTransfer,
    ModelServerTransferStatus,
    ModelServerTransferStatusCancelled,
    ModelServerTransferStatusFailed,
    ModelServerTransferStatusPending,
    ModelServerTransferStatusTimeout,
    ModelServerTransferStatusVerified,
} from "@/types"
import { ArrowLeftRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

// Map status enum to a label key + a Badge variant. Centralised here so the
// table cell and any future drawer agree. Verified is "secondary" because
// the row is no longer actionable; Failed/Timeout use "destructive" to draw
// the operator's attention. Cancelled is "outline" — soft signal, expected.
const statusMeta: Record<
    ModelServerTransferStatus,
    {
        key: string
        variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
    }
> = {
    [ModelServerTransferStatusPending]: { key: "Transfer.StatusPending", variant: "warning" },
    [ModelServerTransferStatusVerified]: { key: "Transfer.StatusVerified", variant: "success" },
    [ModelServerTransferStatusFailed]: { key: "Transfer.StatusFailed", variant: "destructive" },
    [ModelServerTransferStatusTimeout]: { key: "Transfer.StatusTimeout", variant: "destructive" },
    [ModelServerTransferStatusCancelled]: { key: "Transfer.StatusCancelled", variant: "outline" },
}

export default function TransferPage() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const isAdmin = profile?.role === 0
    const callerID = profile?.id
    const { data, mutate, error } = useSWR<ModelServerTransfer[]>("/api/v1/transfer", swrFetcher)

    useEffect(() => {
        if (error) {
            toast(t("Error"), {
                description: t("Results.UnExpectedError", { error: error.message }),
            })
        }
    }, [error, t])

    // Live updates: subscribe to /ws/transfer and patch the SWR cache on each
    // pushed event. We don't refetch on every event because the WS payload IS
    // the latest row — refetching would just cost a round trip.
    //
    // Reconnect contract: the original implementation opened the socket once
    // and never reconnected, so a dashboard restart, deploy, or transient
    // network blip silently froze this view — rows stayed Pending forever
    // even after the agent had reconnected and the backend had transitioned
    // them, and operators only discovered it on a hard refresh. Reconnect
    // with capped exponential backoff (1s → 30s) and trigger a SWR revalidate
    // on each open so any transitions that broadcast while we were offline
    // are reconciled.
    const wsRef = useRef<WebSocket | null>(null)
    useEffect(() => {
        let cancelled = false
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null
        let backoffMs = 1000
        const maxBackoffMs = 30000

        const connect = () => {
            if (cancelled) return
            const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
            const ws = new WebSocket(`${proto}//${window.location.host}/api/v1/ws/transfer`)
            wsRef.current = ws

            ws.onopen = () => {
                backoffMs = 1000
                // Backfill anything the broker fanned out while we were
                // reconnecting — the broker drops events for full subscribers
                // and there is no replay on the wire.
                mutate()
            }
            ws.onmessage = (ev) => {
                try {
                    const t: ModelServerTransfer = JSON.parse(ev.data)
                    mutate((prev) => {
                        const list = prev ?? []
                        const idx = list.findIndex((x) => x.id === t.id)
                        if (idx === -1) return [t, ...list]
                        const next = list.slice()
                        next[idx] = t
                        return next
                    }, false)
                } catch (e) {
                    // Malformed payload — log and keep the socket open; a refetch
                    // on next mount will re-sync. Closing the WS would be louder
                    // than the actual problem.
                    console.error("transfer ws parse failed", e)
                }
            }
            const scheduleReconnect = () => {
                if (cancelled) return
                if (reconnectTimer !== null) return
                const delay = backoffMs
                backoffMs = Math.min(backoffMs * 2, maxBackoffMs)
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null
                    connect()
                }, delay)
            }
            ws.onclose = scheduleReconnect
            ws.onerror = () => {
                // onerror fires before onclose and may not produce a close
                // event in every browser when the handshake is rejected.
                // Force-close so onclose's reconnect path runs deterministically.
                ws.close()
            }
        }

        connect()

        return () => {
            cancelled = true
            if (reconnectTimer !== null) {
                clearTimeout(reconnectTimer)
                reconnectTimer = null
            }
            const ws = wsRef.current
            wsRef.current = null
            if (ws) {
                // Detach handlers so the close we trigger here doesn't bounce
                // into a reconnect attempt against an unmounted component.
                ws.onopen = null
                ws.onmessage = null
                ws.onclose = null
                ws.onerror = null
                ws.close()
            }
        }
    }, [mutate])

    const onCancel = useCallback(
        async (id: number) => {
            try {
                await cancelServerTransfer(id)
                toast(t("Transfer.CancelRequested"))
                mutate()
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e)
                toast(t("Error"), { description: msg })
            }
        },
        [mutate, t],
    )

    const onRetry = useCallback(
        async (id: number) => {
            try {
                await retryServerTransfer(id)
                toast(t("Transfer.RetryRequested"))
                mutate()
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e)
                toast(t("Error"), { description: msg })
            }
        },
        [mutate, t],
    )

    const rows = useMemo(() => data ?? [], [data])

    return (
        <Page>
            <PageHeader title={t("Transfer.Title")} description={t("Transfer.PageHint")} />
            <Panel>
                <Table className="min-w-[960px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>{t("ServerID")}</TableHead>
                            <TableHead>{t("Transfer.From")}</TableHead>
                            <TableHead>{t("Transfer.To")}</TableHead>
                            <TableHead>{t("Transfer.Initiator")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Transfer.LastError")}</TableHead>
                            <TableHead>{t("CreatedAt")}</TableHead>
                            <TableHead>{t("Actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={9} className="p-0">
                                    <EmptyState icon={ArrowLeftRight} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => {
                                const meta = statusMeta[row.status]
                                const isPending = row.status === ModelServerTransferStatusPending
                                const isTerminalRevert =
                                    row.status === ModelServerTransferStatusFailed ||
                                    row.status === ModelServerTransferStatusTimeout ||
                                    row.status === ModelServerTransferStatusCancelled
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-mono text-xs tabular text-muted-foreground">
                                            {row.id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs tabular">
                                            {row.server_id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs tabular">
                                            {row.from_user_id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs tabular">
                                            {row.to_user_id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs tabular">
                                            {row.initiator_id}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={meta.variant}>{t(meta.key)}</Badge>
                                        </TableCell>
                                        <TableCell
                                            className="max-w-xs truncate"
                                            title={row.last_error}
                                        >
                                            {row.last_error || "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs tabular text-muted-foreground">
                                            {new Date(row.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            {isPending &&
                                                (isAdmin || row.from_user_id === callerID) && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onCancel(row.id)}
                                                    >
                                                        {t("Cancel")}
                                                    </Button>
                                                )}
                                            {isTerminalRevert && isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onRetry(row.id)}
                                                >
                                                    {t("Transfer.Retry")}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Panel>
        </Page>
    )
}
