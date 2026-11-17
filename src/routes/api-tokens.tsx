import {
    ApiTokenCreateResponse,
    ApiTokenView,
    SCOPE_OPTIONS,
    createApiToken,
    deleteApiToken,
    listApiTokens,
    parseExpiresInDaysInput,
    parseServerIDsInput,
} from "@/api/api-tokens"
import { EmptyState, Page, PageHeader, Panel } from "@/components/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { KeyRound, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

import { PageErrorNotice } from "./lumen-page-parts"

export default function ApiTokensPage() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const isAdmin = profile?.role === 0

    const { data, mutate, isLoading, error } = useSWR<ApiTokenView[]>(
        "/api/v1/api-tokens",
        listApiTokens,
    )

    useEffect(() => {
        if (!error) return
        toast(t("Error"), {
            description: t("Results.ErrorFetchingResource", {
                error: (error as Error)?.message ?? String(error),
            }),
        })
    }, [error, t])

    const [createOpen, setCreateOpen] = useState(false)
    const [revealed, setRevealed] = useState<ApiTokenCreateResponse | null>(null)

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(t("ConfirmDeleteApiToken", { name }))) return
        try {
            await deleteApiToken(id)
            toast(t("ApiTokenRevoked"))
            await mutate()
        } catch (e: any) {
            toast(t("Error"), { description: e.message })
        }
    }

    return (
        <Page className="pg-workspace">
            <PageHeader
                title={t("ApiTokens")}
                description={t("Shell.Desc.ApiTokens")}
                actions={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus />
                        {t("CreateApiToken")}
                    </Button>
                }
            />

            {error && <PageErrorNotice retry={() => mutate()} />}
            <Panel>
                <Table
                    role="table"
                    data-responsive="cards"
                    className="pg-native-table min-w-[860px]"
                >
                    <TableHeader role="rowgroup">
                        <TableRow role="row">
                            <TableHead role="columnheader" data-mobile="title">
                                {t("Name")}
                            </TableHead>
                            <TableHead role="columnheader">{t("Scopes")}</TableHead>
                            <TableHead role="columnheader">{t("ApiTokenServers")}</TableHead>
                            <TableHead role="columnheader">{t("ApiTokenExpiresAt")}</TableHead>
                            <TableHead role="columnheader">{t("ApiTokenLastUsed")}</TableHead>
                            <TableHead role="columnheader" data-mobile="actions">
                                {t("Actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody role="rowgroup">
                        {isLoading ? (
                            <TableRow role="row" className="hover:bg-transparent">
                                <TableCell role="cell" colSpan={6}>
                                    <Skeleton className="h-4 w-full max-w-[60%]" />
                                </TableCell>
                            </TableRow>
                        ) : !data || data.length === 0 ? (
                            <TableRow role="row" className="hover:bg-transparent">
                                <TableCell role="cell" colSpan={6} className="p-0">
                                    <EmptyState icon={KeyRound} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((tok) => (
                                <TableRow role="row" key={tok.id} className="whitespace-nowrap">
                                    <TableCell
                                        role="cell"
                                        data-mobile="title"
                                        data-label={t("Name")}
                                        className="font-medium"
                                    >
                                        <div
                                            className="min-w-32 max-w-60 truncate"
                                            title={tok.name}
                                        >
                                            {tok.name}
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        role="cell"
                                        data-mobile="meta"
                                        data-label={t("Scopes")}
                                        data-span="full"
                                    >
                                        <div className="flex flex-wrap gap-1">
                                            {(tok.scopes ?? []).map((s) => (
                                                <Badge
                                                    key={s}
                                                    variant="secondary"
                                                    className="font-mono"
                                                >
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        role="cell"
                                        data-mobile="meta"
                                        data-label={t("ApiTokenServers")}
                                        data-span="full"
                                        className="font-mono text-xs num"
                                    >
                                        {tok.server_ids?.length
                                            ? tok.server_ids.join(", ")
                                            : t("ApiTokenAllServers")}
                                    </TableCell>
                                    <TableCell
                                        role="cell"
                                        data-mobile="meta"
                                        data-label={t("ApiTokenExpiresAt")}
                                        className="text-xs num text-muted-foreground"
                                    >
                                        {tok.expires_at
                                            ? new Date(tok.expires_at).toLocaleString()
                                            : t("ApiTokenNever")}
                                    </TableCell>
                                    <TableCell
                                        role="cell"
                                        data-mobile="meta"
                                        data-label={t("ApiTokenLastUsed")}
                                        data-span="full"
                                        className="text-xs num text-muted-foreground"
                                    >
                                        {tok.last_used_at
                                            ? `${new Date(tok.last_used_at).toLocaleString()} (${tok.last_used_ip ?? "?"})`
                                            : t("ApiTokenNever")}
                                    </TableCell>
                                    <TableCell role="cell" data-mobile="actions">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(tok.id, tok.name)}
                                        >
                                            {t("Revoke")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Panel>

            <CreateApiTokenDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isAdmin={isAdmin}
                onCreated={(res) => {
                    setRevealed(res)
                    mutate()
                }}
            />

            <RevealedTokenDialog token={revealed} onClose={() => setRevealed(null)} />
        </Page>
    )
}

function CreateApiTokenDialog({
    open,
    onOpenChange,
    isAdmin,
    onCreated,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    isAdmin: boolean
    onCreated: (res: ApiTokenCreateResponse) => void
}) {
    const { t } = useTranslation()
    const [name, setName] = useState("")
    const [scopes, setScopes] = useState<string[]>([])
    const [serverIDs, setServerIDs] = useState("")
    const [expiresInDays, setExpiresInDays] = useState<string>("90")
    const [submitting, setSubmitting] = useState(false)

    const toggleScope = (s: string) => {
        setScopes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
    }

    const submit = async () => {
        if (!name.trim()) {
            toast(t("Error"), { description: t("NameRequired") })
            return
        }
        if (scopes.length === 0) {
            toast(t("Error"), { description: t("ApiTokenScopeRequired") })
            return
        }
        const parsedRes = parseServerIDsInput(serverIDs)
        if (!parsedRes.ok) {
            toast(t("Error"), { description: t("ApiTokenServersInvalid") })
            return
        }
        const parsedServers = parsedRes.value
        const expRes = parseExpiresInDaysInput(expiresInDays)
        if (!expRes.ok) {
            toast(t("Error"), { description: t("ApiTokenExpiryInvalid") })
            return
        }
        const expDays = expRes.value
        setSubmitting(true)
        try {
            const res = await createApiToken({
                name: name.trim(),
                scopes,
                server_ids: parsedServers,
                expires_in_days: expDays,
            })
            onCreated(res)
            onOpenChange(false)
            setName("")
            setScopes([])
            setServerIDs("")
            setExpiresInDays("90")
        } catch (e: any) {
            toast(t("Error"), { description: e.message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("CreateApiToken")}</DialogTitle>
                    <DialogDescription>{t("CreateApiTokenDescription")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("Name")}</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("Scopes")}</Label>
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
                            {SCOPE_OPTIONS.map((s) => {
                                const adminOnly =
                                    s.value === "nezha:*" || s.value === "nezha:admin:*"
                                const disabled = adminOnly && !isAdmin
                                return (
                                    <label
                                        key={s.value}
                                        className={`flex items-start gap-2 text-sm ${disabled ? "opacity-40" : ""}`}
                                    >
                                        <Checkbox
                                            checked={scopes.includes(s.value)}
                                            onCheckedChange={() =>
                                                !disabled && toggleScope(s.value)
                                            }
                                            disabled={disabled}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs">{s.value}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {s.desc}
                                            </span>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="server-ids">{t("ApiTokenServerIDs")}</Label>
                        <Input
                            id="server-ids"
                            placeholder={t("ApiTokenServerIDsPlaceholder")}
                            value={serverIDs}
                            onChange={(e) => setServerIDs(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expires">{t("ApiTokenExpiresInDays")}</Label>
                        <Input
                            id="expires"
                            type="number"
                            min={0}
                            max={3650}
                            value={expiresInDays}
                            onChange={(e) => setExpiresInDays(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={submit} disabled={submitting}>
                        {submitting ? t("Loading") + "..." : t("CreateApiToken")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function RevealedTokenDialog({
    token,
    onClose,
}: {
    token: ApiTokenCreateResponse | null
    onClose: () => void
}) {
    const { t } = useTranslation()
    return (
        <Dialog open={!!token} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="pg-token-reveal sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>{t("ApiTokenCreated")}</DialogTitle>
                    <DialogDescription>{t("ApiTokenRevealOnce")}</DialogDescription>
                </DialogHeader>
                {token && (
                    <div className="space-y-3">
                        <div className="pg-token-warning">{t("ApiTokenStoreSafely")}</div>
                        <code className="pg-token-value">{token.token}</code>
                        <Button
                            className="pg-token-copy"
                            onClick={async () => {
                                await navigator.clipboard.writeText(token.token)
                                toast(t("Copied"))
                            }}
                        >
                            {t("Copy")}
                        </Button>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={onClose}>{t("Done")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
