import { TerminalPage } from "@/components/terminal"
import { act, cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

const session = vi.hoisted(() => ({
    server_name: "dev-host",
    session_id: "dev-session",
    server_id: 1,
}))
vi.mock("@/hooks/useTerminal", () => ({ default: () => session }))
vi.mock("@/components/fm", () => ({ FMCard: () => null }))
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
    initReactI18next: { type: "3rdParty", init: () => undefined },
}))
vi.mock("@xterm/addon-fit", () => ({
    FitAddon: class {
        fit() {}
    },
}))
vi.mock("@xterm/xterm", () => ({
    Terminal: class {
        cols = 80
        rows = 24
        loadAddon() {}
        open() {}
        focus() {}
        dispose() {}
        onData() {
            return { dispose() {} }
        }
        onBinary() {
            return { dispose() {} }
        }
    },
}))

class HeaderWebSocket {
    static OPEN = 1
    static instances: HeaderWebSocket[] = []
    readyState = 0
    onopen: (() => void) | null = null
    onmessage: (() => void) | null = null
    onclose: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor() {
        HeaderWebSocket.instances.push(this)
    }
    send() {}
    close() {
        this.readyState = 3
    }
}

beforeEach(() => {
    HeaderWebSocket.instances = []
    session.server_name = "dev-host"
    vi.stubGlobal("WebSocket", HeaderWebSocket)
    vi.stubGlobal(
        "requestAnimationFrame",
        vi.fn(() => 1),
    )
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
})
afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
})

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/terminal/1"]}>
            <Routes>
                <Route path="/terminal/:id" element={<TerminalPage />} />
            </Routes>
        </MemoryRouter>,
    )
}

test("terminal header shows real server name and projects connecting/connected/disconnected", () => {
    renderPage()
    expect(screen.getByRole("heading", { name: "dev-host" })).toBeTruthy()
    const chip = screen.getByRole("status")
    expect(chip.textContent).toBe("v2Forms.terminal.connecting")
    expect(chip.dataset.tone).toBe("warning")
    const socket = HeaderWebSocket.instances[0]
    act(() => {
        socket.readyState = 1
        socket.onopen?.()
    })
    expect(chip.textContent).toBe("v2Forms.terminal.connected")
    expect(chip.dataset.tone).toBe("success")
    act(() => socket.onclose?.())
    expect(chip.textContent).toBe("v2Forms.terminal.disconnected")
    expect(chip.dataset.tone).toBe("danger")
    expect(HeaderWebSocket.instances).toHaveLength(1)
})

test("terminal header falls back to original Terminal(id) title when server name is absent", () => {
    session.server_name = ""
    renderPage()
    expect(screen.getByRole("heading", { name: "Terminal (1)" })).toBeTruthy()
})
