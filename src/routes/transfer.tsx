import { swrFetcher } from "@/api/api"
import { cancelServerTransfer, retryServerTransfer } from "@/api/transfer"
import { EmptyState, Page, PageHeader, Panel } from "@/components/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

import { PageErrorNotice } from "./lumen-page-parts"

// 只映射已有终态的呈现；不从连接状态推断转移进度。
const statusMeta: Record<
    ModelServerTransferStatus,
    {
        key: string
        tone: "success" | "warning" | "danger" | "neutral"
    }
> = {
    [ModelServerTransferStatusPending]: { key: "Transfer.StatusPending", tone: "warning" },
    [ModelServerTransferStatusVerified]: { key: "Transfer.StatusVerified", tone: "success" },
    [ModelServerTransferStatusFailed]: { key: "Transfer.StatusFailed", tone: "danger" },
    [ModelServerTransferStatusTimeout]: { key: "Transfer.StatusTimeout", tone: "danger" },
    [ModelServerTransferStatusCancelled]: { key: "Transfer.StatusCancelled", tone: "neutral" },
}

export default function TransferPage() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const isAdmin = profile?.role === 0
    const callerID = profile?.id
    const { data, mutate, error, isLoading } = useSWR<ModelServerTransfer[]>(
        "/api/v1/transfer",
        swrFetcher,
    )
    const [connection, setConnection] = useState<"connecting" | "connected" | "reconnecting">(
        "connecting",
    )

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
                setConnection("connected")
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
                setConnection("reconnecting")
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
        <Page className="pg-workspace">
            <PageHeader
                title={t("Transfer.Title")}
                description={t("Transfer.PageHint")}
                actions={
                    <span
                        role="status"
                        className="chip"
                        data-tone={
                            connection === "connected"
                                ? "success"
                                : connection === "connecting"
                                  ? "warning"
                                  : "danger"
                        }
                    >
                        {t(`v2Pages.transfer.${connection}`)}
                    </span>
                }
            />
            {error && <PageErrorNotice retry={() => mutate()} />}
            <Panel>
                <Table
                    role="table"
                    data-responsive="cards"
                    className="pg-native-table min-w-[960px]"
                >
                    <TableHeader role="rowgroup">
                        <TableRow role="row">
                            <TableHead role="columnheader" data-mobile="title">
                                ID
                            </TableHead>
                            <TableHead role="columnheader">{t("ServerID")}</TableHead>
                            <TableHead role="columnheader">{t("Transfer.From")}</TableHead>
                            <TableHead role="columnheader">{t("Transfer.To")}</TableHead>
                            <TableHead role="columnheader">{t("Transfer.Initiator")}</TableHead>
                            <TableHead role="columnheader">{t("Status")}</TableHead>
                            <TableHead role="columnheader">{t("Transfer.LastError")}</TableHead>
                            <TableHead role="columnheader">{t("CreatedAt")}</TableHead>
                            <TableHead role="columnheader" data-mobile="actions">
                                {t("Actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody role="rowgroup">
                        {isLoading ? (
                            Array.from({ length: 3 }, (_, i) => (
                                <TableRow role="row" key={`loading-${i}`}>
                                    <TableCell role="cell" colSpan={9}>
                                        <Skeleton className="h-4 w-full max-w-[60%]" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
                            <TableRow role="row" className="hover:bg-transparent">
                                <TableCell role="cell" colSpan={9} className="p-0">
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
                                    <TableRow role="row" key={row.id} className="whitespace-nowrap">
                                        <TableCell
                                            role="cell"
                                            data-mobile="title"
                                            data-label="ID"
                                            className="font-mono text-xs num text-muted-foreground"
                                        >
                                            {row.id}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("ServerID")}
                                            className="font-mono text-xs num"
                                        >
                                            {row.server_id}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("Transfer.From")}
                                            className="font-mono text-xs num"
                                        >
                                            {row.from_user_id}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("Transfer.To")}
                                            className="font-mono text-xs num"
                                        >
                                            {row.to_user_id}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("Transfer.Initiator")}
                                            className="font-mono text-xs num"
                                        >
                                            {row.initiator_id}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("Status")}
                                        >
                                            <span className="chip" data-tone={meta.tone}>
                                                {t(meta.key)}
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("Transfer.LastError")}
                                            data-span="full"
                                            className="max-w-xs truncate"
                                            title={row.last_error}
                                        >
                                            {row.last_error || "-"}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="meta"
                                            data-label={t("CreatedAt")}
                                            data-span="full"
                                            className="whitespace-nowrap text-xs num text-muted-foreground"
                                        >
                                            {new Date(row.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            role="cell"
                                            data-mobile="actions"
                                            className="space-x-2"
                                        >
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
