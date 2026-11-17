import { DataTable } from "@/components/data-table"
import { AppShell, Sidebar } from "@/components/app-shell"
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import { Table as PlainTable, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { HeaderButtonGroup } from "@/components/header-button-group"
import Login from "@/routes/login"
import { MultiSelect } from "@/components/xui/multi-select"
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createRef, useState } from "react"
import { PageHeader } from "@/components/page"
import { IconButton } from "@/components/xui/icon-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogTrigger } from "@/components/ui/dialog"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({ profile: { username: "local-user", role: 0 }, login: vi.fn(), oauth: vi.fn() }))
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ profile: mocks.profile, loading: false, login: mocks.login, loginOauth2: mocks.oauth, logout: vi.fn() }) }))
vi.mock("@/hooks/useMainStore", () => ({ useMainStore: (selector: any) => selector({ profile: mocks.profile }) }))
vi.mock("@/hooks/useSetting", () => ({ default: () => ({ data: { version: "test", config: { site_name: "Local test", oauth2_providers: [] } } }) }))
vi.mock("react-i18next", () => ({ initReactI18next: { type: "3rdParty", init: () => {} }, useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en-US", changeLanguage: vi.fn() } }) }))
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn() }) }))

beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 })
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) })
    mocks.profile.role = 0
    mocks.login.mockReset()
    mocks.login.mockResolvedValue(undefined)
})
afterEach(() => { cleanup(); document.documentElement.classList.remove("light", "dark") })

type Definition = { id: string; header?: unknown; meta?: { mobile?: "title" | "meta" | "hide"; label?: string; span?: "full" } }
function DemoTable({ definitions, count = 1 }: { definitions: Definition[]; count?: number }) {
    const [selected, setSelected] = useState(false)
    const columns = definitions.map(({ id, ...columnDef }) => ({ id, columnDef: { ...columnDef, cell: () => id === "select" ? <input type="checkbox" aria-label="Select row" checked={selected} onChange={(event) => setSelected(event.target.checked)} /> : <span>{id === "actions" ? <button>row action</button> : `${id}-value`}</span> } }))
    const table = {
        getHeaderGroups: () => [{ id: "head", headers: columns.map((column) => ({ id: column.id, isPlaceholder: false, column, getContext: () => ({}) })) }],
        getRowModel: () => ({ rows: Array.from({ length: count }, (_, index) => ({ id: String(index), getIsSelected: () => selected, getVisibleCells: () => columns.map((column) => ({ id: column.id, column, getContext: () => ({}) })) })) }),
    }
    return <DataTable table={table} columnCount={columns.length} minWidth={1000} />
}

test("mobile cards keep one title, selection, actions, full metadata, and string-only label fallback", () => {
    render(<DemoTable definitions={[
        { id: "select" }, { id: "name", header: "Name", meta: { mobile: "title" } },
        { id: "second", header: () => <b>Function</b>, meta: { mobile: "title", label: "Second" } },
        { id: "function", header: () => <b>Custom</b> }, { id: "node", header: <b>Node</b> },
        { id: "uuid", header: "UUID", meta: { span: "full" } }, { id: "actions" },
    ]} />)
    const table = screen.getByRole("table")
    expect(table.getAttribute("data-responsive")).toBe("cards")
    expect(table.querySelectorAll('td[data-mobile="title"]').length).toBe(1)
    expect(table.querySelector('td[data-column="second"]')?.getAttribute("data-mobile")).toBe("meta")
    expect(table.querySelector('td[data-column="second"]')?.getAttribute("data-label")).toBe("Second")
    expect(table.querySelector('td[data-column="function"]')?.hasAttribute("data-label")).toBe(false)
    expect(table.querySelector('td[data-column="node"]')?.hasAttribute("data-label")).toBe(false)
    expect(table.querySelector('td[data-column="uuid"]')?.getAttribute("data-span")).toBe("full")
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row" }))
    expect(table.querySelector('tbody tr')?.getAttribute("data-state")).toBe("selected")
    expect(screen.getByRole("button", { name: "row action" })).not.toBeNull()
    expect(table.textContent).not.toContain("[object Object]")
})

test("no-meta table uses first data column and unmarked ui tables stay opt-out", () => {
    render(<><DemoTable definitions={[{ id: "select" }, { id: "id", header: "ID" }, { id: "name", header: "Name" }]} /><PlainTable><TableBody><TableRow><TableCell>virtual table boundary</TableCell></TableRow></TableBody></PlainTable></>)
    const tables = screen.getAllByRole("table")
    expect(tables[0].querySelector('td[data-mobile="title"]')?.getAttribute("data-column")).toBe("id")
    expect(tables[1].hasAttribute("data-responsive")).toBe(false)
    expect(tables[0].querySelector("thead")?.getAttribute("role")).toBe("rowgroup")
    expect(tables[0].querySelector("th")?.getAttribute("role")).toBe("columnheader")
})

test("more than 200 rows use compact density", () => {
    render(<DemoTable definitions={[{ id: "name", header: "Name" }]} count={201} />)
    expect(screen.getByRole("table").getAttribute("data-density")).toBe("high")
})

test("DialogContent default retains dialog classes and sheet opts into Radix portal size", () => {
    const { unmount } = render(<Dialog open><DialogContent><DialogTitle>Default</DialogTitle><DialogDescription>Description</DialogDescription></DialogContent></Dialog>)
    expect(screen.getByRole("dialog").className).toContain("left-[50%]")
    expect(screen.getByRole("dialog").className).not.toContain("sh-sheet")
    expect(screen.getByRole("dialog").getAttribute("data-variant")).toBe("dialog")
    unmount()
    render(<Dialog open><DialogContent variant="sheet" size="lg"><DialogTitle>Sheet</DialogTitle><DialogDescription>Description</DialogDescription><input aria-label="Sheet input" /></DialogContent></Dialog>)
    expect(screen.getByRole("dialog").className).toContain("sh-sheet")
    expect(screen.getByRole("dialog").getAttribute("data-size")).toBe("lg")
    expect(screen.getByRole("button", { name: "Close" })).not.toBeNull()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
})

test("sidebar preference wins and narrow unset preference defaults collapsed", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 })
    const { unmount } = render(<MemoryRouter><AppShell>Page</AppShell></MemoryRouter>)
    expect(document.querySelector("aside")?.classList.contains("sh-sidebar-collapsed")).toBe(true)
    expect(localStorage.getItem("nz-sidebar-collapsed")).toBeNull()
    unmount()
    localStorage.setItem("nz-sidebar-collapsed", "0")
    render(<MemoryRouter><AppShell>Page</AppShell></MemoryRouter>)
    expect(document.querySelector("aside")?.classList.contains("sh-sidebar-collapsed")).toBe(false)
    fireEvent.click(screen.getByRole("button", { name: "Shell.Collapse" }))
    expect(localStorage.getItem("nz-sidebar-collapsed")).toBe("1")
})

test("regular users retain profile/PAT but never see admin navigation", () => {
    mocks.profile.role = 1
    render(<MemoryRouter><Sidebar collapsed={false} onToggle={() => {}} /></MemoryRouter>)
    expect(screen.queryByRole("link", { name: "Shell.WAF" })).toBeNull()
    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull()
    expect(screen.getByRole("link", { name: "ApiTokens" })).not.toBeNull()
    expect(screen.getByRole("link", { name: "Profile" })).not.toBeNull()
})

test("theme persistence and theme-color use Lumen values", () => {
    function Toggle() { const { setTheme } = useTheme(); return <button onClick={() => setTheme("dark")}>Dark</button> }
    render(<ThemeProvider><Toggle /></ThemeProvider>)
    fireEvent.click(screen.getByRole("button", { name: "Dark" }))
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#070B14")
})

test("one bulk action is disabled without selection and uses existing handler with selection", async () => {
    const fn = vi.fn(async () => {}), mutate = vi.fn(async () => undefined)
    const { rerender } = render(<HeaderButtonGroup delete={{ id: [], fn, mutate }}>Child</HeaderButtonGroup>)
    expect(screen.getAllByRole("button").length).toBe(1)
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
    rerender(<HeaderButtonGroup delete={{ id: [1], fn, mutate }}>Child</HeaderButtonGroup>)
    fireEvent.click(screen.getByRole("button", { name: "v2Shell.actions.deleteSelected" }))
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() => expect(fn).toHaveBeenCalledWith([1]))
    expect(mutate).toHaveBeenCalledTimes(1)
})

test.each(["light", "dark"])("MultiSelect %s keeps secondary surface for empty, selected and disabled states", (theme) => {
    document.documentElement.classList.add(theme)
    const onValueChange = vi.fn()
    const options = [{ value: "one", label: "Option one" }, { value: "two", label: "Option two" }]
    const { rerender } = render(<MultiSelect key="empty" aria-label="Multi" options={options} onValueChange={onValueChange} placeholder="Choose items" />)
    let trigger = screen.getByRole("button", { name: "Multi" }) as HTMLButtonElement
    expect(trigger.getAttribute("data-variant")).toBe("outline")
    expect(trigger.textContent).toContain("Choose items")
    expect(trigger.className).toContain("bg-card")
    rerender(<MultiSelect key="selected" aria-label="Multi" options={options} onValueChange={onValueChange} defaultValue={["one"]} />)
    trigger = screen.getByRole("button", { name: "Multi" }) as HTMLButtonElement
    expect(trigger.textContent).toContain("Option one")
    expect(trigger.getAttribute("data-variant")).toBe("outline")
    rerender(<MultiSelect key="disabled" aria-label="Multi" disabled options={options} onValueChange={onValueChange} />)
    trigger = screen.getByRole("button", { name: "Multi" }) as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
    expect(trigger.getAttribute("data-variant")).toBe("outline")
    expect(onValueChange).not.toHaveBeenCalled()
})

test("icon-only names prefer nonempty aria-label, then title, then icon i18n mapping", () => {
    const { rerender } = render(<IconButton icon="edit" aria-label="Specific edit" title="Title edit" />)
    expect(screen.getByRole("button", { name: "Specific edit" })).not.toBeNull()
    rerender(<IconButton icon="edit" aria-label="  " title="Title edit" />)
    expect(screen.getByRole("button", { name: "Title edit" })).not.toBeNull()
    rerender(<IconButton icon="edit" aria-label="" title="  " />)
    expect(screen.getByRole("button", { name: "v2Shell.actions.edit" })).not.toBeNull()
    rerender(<IconButton icon="plus" />)
    const inline = screen.getByRole("button", { name: "Add" })
    expect(inline.getAttribute("data-size")).toBe("icon")
    expect(inline.className).not.toContain("sh-header-create")
    expect(inline.textContent).toBe("")
    rerender(<IconButton icon="more" aria-label="Caller more" />)
    expect(screen.getByRole("button", { name: "Caller more" })).not.toBeNull()
    rerender(<IconButton icon="more" />)
    expect(screen.getByRole("button", { name: "v2Shell.actions.more" })).not.toBeNull()
})

test("PageHeader plus shows real Add text through context without changing Radix trigger, ref or handler", () => {
    const ref = createRef<HTMLButtonElement>(), handler = vi.fn()
    render(<Dialog><PageHeader title="Header" actions={<DialogTrigger asChild><IconButton ref={ref} icon="plus" onClick={handler} /></DialogTrigger>} /><DialogContent><DialogTitle>Create</DialogTitle><DialogDescription>Create description</DialogDescription><IconButton icon="plus" aria-label="Inline nested plus" /></DialogContent></Dialog>)
    const trigger = screen.getByRole("button", { name: "Add" })
    expect(trigger.textContent).toBe("Add")
    expect(trigger.className).toContain("sh-header-create")
    expect(trigger.getAttribute("data-size")).toBe("default")
    expect(ref.current).toBe(trigger)
    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("dialog")).not.toBeNull()
    const nested = screen.getByRole("button", { name: "Inline nested plus" })
    expect(nested.textContent).toBe("")
    expect(nested.className).not.toContain("sh-header-create")
})

test("header context preserves explicit children, explicit names, disabled and IconButton asChild", () => {
    const handler = vi.fn(), ref = createRef<HTMLAnchorElement>()
    render(<><PageHeader title="Header" actions={<IconButton icon="plus" aria-label="Explicit create" disabled onClick={handler}><span>Custom content</span></IconButton>} /><IconButton icon="edit" asChild ref={ref as any}><a href="#local">Explicit link content</a></IconButton></>)
    const create = screen.getByRole("button", { name: "Explicit create" }) as HTMLButtonElement
    expect(create.textContent).toBe("Custom content")
    expect(create.disabled).toBe(true)
    fireEvent.click(create)
    expect(handler).not.toHaveBeenCalled()
    const link = screen.getByRole("link", { name: "Explicit link content" })
    expect(link.textContent).toBe("Explicit link content")
    expect(ref.current).toBe(link)
})

test("Input and Textarea placeholders use full muted token and opacity without changing values", () => {
    render(<><Input aria-label="Full input" placeholder="Placeholder input" defaultValue="Existing input" /><Textarea aria-label="Full textarea" placeholder="Placeholder textarea" defaultValue="Existing textarea" /></>)
    for (const control of [screen.getByLabelText("Full input"), screen.getByLabelText("Full textarea")]) {
        expect(control.className).toContain("placeholder:text-muted-foreground")
        expect(control.className).toContain("placeholder:opacity-100")
        expect(control.className).not.toContain("placeholder:text-muted-foreground/70")
    }
    expect((screen.getByLabelText("Full input") as HTMLInputElement).value).toBe("Existing input")
    expect((screen.getByLabelText("Full textarea") as HTMLTextAreaElement).value).toBe("Existing textarea")
})

test("login pending disables only the submitting form, without waiting on initial auth probe", async () => {
    let resolve!: () => void
    mocks.login.mockImplementation(() => new Promise<void>((done) => { resolve = done }))
    render(<MemoryRouter><Login /></MemoryRouter>)
    const submit = screen.getByRole("button", { name: "Login" }) as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "local-user" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "local-only" } })
    fireEvent.click(submit)
    await waitFor(() => expect(submit.disabled).toBe(true))
    expect(mocks.login).toHaveBeenCalledWith("local-user", "local-only")
    await act(async () => resolve())
    await waitFor(() => expect(submit.disabled).toBe(false))
})
