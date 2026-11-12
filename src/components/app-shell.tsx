import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useMainStore } from "@/hooks/useMainStore"
import useSetting from "@/hooks/useSetting"
import { cn } from "@/lib/utils"
import { nezhaLang } from "@/types/settings"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
    Activity,
    ArrowLeftRight,
    BellRing,
    CalendarClock,
    ExternalLink,
    FolderTree,
    Globe,
    KeyRound,
    Languages,
    LogOut,
    LucideIcon,
    Menu,
    Monitor,
    Moon,
    Network,
    PanelLeftClose,
    PanelLeftOpen,
    Send,
    Server,
    Settings,
    ShieldAlert,
    Sun,
    User2,
    UserCheck,
    Users,
    UsersRound,
    X,
} from "lucide-react"
import { DateTime } from "luxon"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

type NavItem = {
    href: string
    label: string
    icon: LucideIcon
    adminOnly?: boolean
    // Extra pathnames that should highlight this entry.
    match?: (pathname: string) => boolean
}

type NavGroup = {
    label: string
    items: NavItem[]
}

const COLLAPSE_KEY = "nz-sidebar-collapsed"

function readCollapsed() {
    try {
        return localStorage.getItem(COLLAPSE_KEY) === "1"
    } catch {
        return false
    }
}

function writeCollapsed(value: boolean) {
    try {
        localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0")
    } catch {
        // storage unavailable (private mode) — the toggle still works for this session
    }
}

function useNavGroups(): NavGroup[] {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const isAdmin = profile?.role === 0

    const groups: NavGroup[] = [
        {
            label: t("Shell.Groups.Servers"),
            items: [
                { href: "/dashboard", label: t("Server"), icon: Server },
                {
                    href: "/dashboard/server-group",
                    label: t("Shell.ServerGroup"),
                    icon: FolderTree,
                },
                { href: "/dashboard/transfer", label: t("Transfer.Title"), icon: ArrowLeftRight },
            ],
        },
        {
            label: t("Shell.Groups.Monitoring"),
            items: [
                { href: "/dashboard/service", label: t("Service"), icon: Activity },
                { href: "/dashboard/alert-rule", label: t("AlertRule"), icon: BellRing },
                { href: "/dashboard/notification", label: t("Shell.Notifier"), icon: Send },
                {
                    href: "/dashboard/notification-group",
                    label: t("Shell.NotificationGroup"),
                    icon: UsersRound,
                },
            ],
        },
        {
            label: t("Shell.Groups.Automation"),
            items: [
                { href: "/dashboard/cron", label: t("Task"), icon: CalendarClock },
                { href: "/dashboard/ddns", label: t("DDNS"), icon: Globe },
                { href: "/dashboard/nat", label: t("NATT"), icon: Network },
            ],
        },
        {
            label: t("Shell.Groups.Security"),
            items: [
                {
                    href: "/dashboard/settings/waf",
                    label: t("Shell.WAF"),
                    icon: ShieldAlert,
                    adminOnly: true,
                },
                {
                    href: "/dashboard/settings/online-user",
                    label: t("OnlineUser"),
                    icon: UserCheck,
                    adminOnly: true,
                },
                { href: "/dashboard/settings/api-tokens", label: t("ApiTokens"), icon: KeyRound },
                {
                    href: "/dashboard/settings/user",
                    label: t("User"),
                    icon: Users,
                    adminOnly: true,
                },
            ],
        },
        {
            label: t("Shell.Groups.System"),
            items: [
                {
                    href: "/dashboard/settings",
                    label: t("Settings"),
                    icon: Settings,
                    adminOnly: true,
                },
                { href: "/dashboard/profile", label: t("Profile"), icon: User2 },
            ],
        },
    ]

    return groups
        .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || isAdmin) }))
        .filter((g) => g.items.length > 0)
}

function isActive(item: NavItem, pathname: string) {
    const normalized = pathname.replace(/\/+$/, "") || "/dashboard"
    return normalized === item.href || !!item.match?.(normalized)
}

export function useCurrentPage() {
    const { t } = useTranslation()
    const groups = useNavGroups()
    const { pathname } = useLocation()
    for (const g of groups) {
        for (const item of g.items) {
            if (isActive(item, pathname)) return { group: g.label, label: item.label }
        }
    }
    if (pathname.startsWith("/dashboard/terminal")) {
        return { group: t("Shell.Groups.Servers"), label: t("Terminal") }
    }
    return undefined
}

function Brand({ collapsed }: { collapsed?: boolean }) {
    const { t } = useTranslation()
    const { data: settingData } = useSetting()
    const name = settingData?.config?.site_name || t("nezha")
    return (
        <Link
            to="/dashboard"
            className="flex h-14 shrink-0 items-center gap-2.5 overflow-hidden px-4"
            title={name}
        >
            <img className="h-6 w-6 shrink-0" src="/dashboard/logo.svg" alt="" />
            {!collapsed && (
                <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[13px] font-semibold text-foreground">
                        {name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                        {t("Shell.Console")}
                    </span>
                </span>
            )}
        </Link>
    )
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
    const groups = useNavGroups()
    const { pathname } = useLocation()
    return (
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
            {groups.map((group) => (
                <div key={group.label} className="pt-3 first:pt-2">
                    {collapsed ? (
                        <div className="mx-2 mb-2 h-px bg-border" aria-hidden />
                    ) : (
                        <div className="px-2.5 pb-1.5 text-[11px] font-medium text-muted-foreground/80">
                            {group.label}
                        </div>
                    )}
                    <ul className="space-y-0.5">
                        {group.items.map((item) => {
                            const active = isActive(item, pathname)
                            const Icon = item.icon
                            return (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        onClick={onNavigate}
                                        title={collapsed ? item.label : undefined}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150",
                                            collapsed && "justify-center px-0",
                                            active
                                                ? "bg-primary/10 text-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        {active && (
                                            <span
                                                aria-hidden
                                                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                                            />
                                        )}
                                        <Icon
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                active
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover:text-foreground",
                                            )}
                                        />
                                        {!collapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    )
}

function SidebarFooter({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
    const { t } = useTranslation()
    const { data: settingData } = useSetting()
    const label = collapsed ? t("Shell.Expand") : t("Shell.Collapse")
    return (
        <div
            className={cn(
                "flex h-11 shrink-0 items-center justify-between gap-2 border-t px-4",
                collapsed && "justify-center px-0",
            )}
        >
            {!collapsed && (
                <span className="truncate font-mono text-[11px] text-muted-foreground/80 tabular">
                    v{settingData?.version ?? ""}
                </span>
            )}
            {onToggle && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onToggle}
                    aria-label={label}
                    title={label}
                >
                    {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
            )}
        </div>
    )
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    return (
        <aside
            className={cn(
                "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-150 ease-out lg:flex",
                collapsed ? "w-16" : "w-60",
            )}
        >
            <div className="flex items-center justify-between border-b">
                <Brand collapsed={collapsed} />
            </div>
            <NavList collapsed={collapsed} />
            <SidebarFooter collapsed={collapsed} onToggle={onToggle} />
        </aside>
    )
}

function MobileNav() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-1.5 lg:hidden"
                    aria-label="Toggle Menu"
                >
                    <Menu />
                </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-card shadow-overlay duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
                    <DialogPrimitive.Title className="sr-only">
                        {t("NavigateTo")}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="sr-only">
                        {t("SelectAPageToNavigateTo")}
                    </DialogPrimitive.Description>
                    <div className="flex items-center justify-between border-b pr-2">
                        <Brand />
                        <DialogPrimitive.Close asChild>
                            <Button variant="ghost" size="icon" aria-label={t("Close")}>
                                <X />
                            </Button>
                        </DialogPrimitive.Close>
                    </div>
                    <NavList onNavigate={() => setOpen(false)} />
                    <SidebarFooter />
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

export function ThemeMenu() {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("Shell.Theme")}
                    title={t("Shell.Theme")}
                >
                    <Sun className="dark:hidden" />
                    <Moon className="hidden dark:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(v) => setTheme(v as typeof theme)}
                >
                    <DropdownMenuRadioItem value="light">
                        <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t("theme.light")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                        <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t("theme.dark")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                        <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t("theme.system")}
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function LanguageMenu() {
    const { t, i18n } = useTranslation()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("Language")}
                    title={t("Language")}
                >
                    <Languages />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-56 overflow-y-auto">
                <DropdownMenuLabel>{t("Language")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={i18n.language}
                    onValueChange={(lng) => i18n.changeLanguage(lng)}
                >
                    {Object.entries(nezhaLang).map(([code, name]) => (
                        <DropdownMenuRadioItem key={code} value={code}>
                            {name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// https://github.com/streamich/react-use/blob/master/src/useInterval.ts
const useInterval = (callback: () => void, delay?: number | null) => {
    const savedCallback = useRef<() => void>(() => {})
    useEffect(() => {
        savedCallback.current = callback
    })
    useEffect(() => {
        if (delay !== null) {
            const interval = setInterval(() => savedCallback.current(), delay || 0)
            return () => clearInterval(interval)
        }
        return undefined
    }, [delay])
}

function Clock() {
    const { t } = useTranslation()
    const timeOption = { ...DateTime.TIME_SIMPLE, hour12: true }
    const [timeString, setTimeString] = useState(
        DateTime.now().setLocale("en-US").toLocaleString(timeOption),
    )
    useInterval(() => {
        setTimeString(DateTime.now().setLocale("en-US").toLocaleString(timeOption))
    }, 1000)
    return (
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
            {t("CurrentTime")}
            <span className="tabular text-foreground">{timeString}</span>
        </span>
    )
}

function UserMenu() {
    const { t } = useTranslation()
    const { logout } = useAuth()
    const profile = useMainStore((store) => store.profile)
    const navigate = useNavigate()
    const isAdmin = profile?.role === 0
    if (!profile) return null
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="ml-1 flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted sm:rounded-md sm:py-1 sm:pl-1 sm:pr-2"
                    aria-label={profile.username}
                >
                    <Avatar className="h-7 w-7 border">
                        <AvatarImage
                            src={
                                "https://api.dicebear.com/7.x/notionists/svg?seed=" +
                                profile.username
                            }
                            alt={profile.username}
                        />
                        <AvatarFallback className="text-xs">
                            {profile.username.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-32 truncate text-[13px] font-medium sm:block">
                        {profile.username}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-0.5 font-normal">
                    <div className="break-all text-[13px] font-medium text-foreground">
                        {profile.username}
                    </div>
                    {profile.login_ip && (
                        <div className="font-mono text-xs text-muted-foreground">
                            {t("Shell.LoggedInFrom", { ip: profile.login_ip })}
                        </div>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                    <User2 />
                    {t("Profile")}
                </DropdownMenuItem>
                {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                        <Settings />
                        {t("Settings")}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <a href="/" rel="noopener noreferrer">
                        <ExternalLink />
                        {t("BackToHome")}
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut />
                    {t("Logout")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function Topbar() {
    const { t } = useTranslation()
    const current = useCurrentPage()
    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-5 lg:px-6">
            <MobileNav />
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
                {current ? (
                    <>
                        <span className="hidden truncate text-muted-foreground sm:inline">
                            {current.group}
                        </span>
                        <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
                            /
                        </span>
                        <span className="truncate font-medium text-foreground">
                            {current.label}
                        </span>
                    </>
                ) : (
                    <span className="truncate font-medium">{t("nezha")}</span>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
                <Clock />
                <a
                    href="/"
                    rel="noopener noreferrer"
                    className="mr-1 hidden h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("BackToHome")}
                </a>
                <LanguageMenu />
                <ThemeMenu />
                <UserMenu />
            </div>
        </header>
    )
}

export function AppShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
    const [collapsed, setCollapsed] = useState(readCollapsed)
    const toggle = () => {
        setCollapsed((c) => {
            writeCollapsed(!c)
            return !c
        })
    }
    return (
        <div className="flex min-h-dvh w-full">
            <Sidebar collapsed={collapsed} onToggle={toggle} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />
                <main className="min-w-0 flex-1">{children}</main>
                {footer}
            </div>
        </div>
    )
}
