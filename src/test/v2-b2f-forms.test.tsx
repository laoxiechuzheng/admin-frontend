import { AlertRuleCard } from "@/components/alert-rule"
import { CronCard } from "@/components/cron"
import { DDNSCard } from "@/components/ddns"
import { ServiceCard } from "@/components/service"
import type { ModelAlertRule, ModelCron, ModelDDNSProfile, ModelService } from "@/types"
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

const api = vi.hoisted(() => ({
    service: vi.fn(),
    ddns: vi.fn(),
    alert: vi.fn(),
    cron: vi.fn(),
}))

vi.mock("@/api/service", () => ({ createService: api.service, updateService: api.service }))
vi.mock("@/api/ddns", () => ({ createDDNSProfile: api.ddns, updateDDNSProfile: api.ddns }))
vi.mock("@/api/alert-rule", () => ({ createAlertRule: api.alert, updateAlertRule: api.alert }))
vi.mock("@/api/cron", () => ({ createCron: api.cron, updateCron: api.cron }))
vi.mock("sonner", () => ({ toast: vi.fn() }))
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
    initReactI18next: { type: "3rdParty", init: () => undefined },
}))
vi.mock("@/hooks/useServer", () => ({ useServer: () => ({ servers: [] }) }))
vi.mock("@/hooks/useNotfication", () => ({
    useNotification: () => ({ notifierGroup: [{ group: { id: 1, name: "dev-group" } }] }),
}))

const mutate = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    Object.values(api).forEach((fn) => fn.mockResolvedValue(undefined))
})
afterEach(cleanup)

async function openCard() {
    await act(async () => fireEvent.click(screen.getByRole("button")))
    return screen.findByRole("dialog")
}

function submit(dialog: HTMLElement) {
    const form = dialog.querySelector("form")!
    fireEvent.submit(form)
}

function field(dialog: HTMLElement, name: string) {
    return dialog.querySelector<HTMLInputElement>(`[name="${name}"]`)!
}

const fixtureTimes = {
    created_at: "2026-11-18T00:00:00Z",
    updated_at: "2026-11-18T00:00:00Z",
}

const serviceData: ModelService = {
    ...fixtureTimes,
    id: 7,
    name: "dev-service",
    type: 1,
    cover: 0,
    display_index: 2,
    target: "example.test:443",
    max_latency: 100,
    min_latency: 2,
    duration: 8,
    failure_threshold: 3,
    notification_group_id: 1,
    fail_trigger_tasks: [2, 8],
    recover_trigger_tasks: [3, 9],
    skip_servers: { "11": true, "12": true },
    notify: true,
    latency_notify: true,
    enable_trigger_task: true,
    hide_for_guest: false,
}

test("service sheet keeps all fields, native form submission, dirty hint and task arrays", async () => {
    render(<ServiceCard data={serviceData} mutate={mutate} />)
    const dialog = await openCard()
    expect(dialog.dataset.variant).toBe("sheet")
    expect(dialog.dataset.size).toBe("md")
    const form = dialog.querySelector("form")!
    expect([...form.children].map((node) => node.className)).toEqual([
        expect.stringContaining("fs-sheet-head"),
        "fs-sheet-body",
        expect.stringContaining("fs-sheet-foot"),
    ])
    const submitButton = within(dialog).getByRole("button", { name: "Submit" }) as HTMLButtonElement
    expect(submitButton.form).toBe(form)
    expect(submitButton.disabled).toBe(false)
    expect(screen.queryByText("v2Forms.unsaved")).toBeNull()
    expect(field(dialog, "duration").min).toBe("1")
    expect(field(dialog, "failure_threshold").min).toBe("1")
    expect(field(dialog, "failure_threshold").max).toBe("100")
    fireEvent.change(field(dialog, "name"), { target: { value: "dev-renamed" } })
    await screen.findByText("v2Forms.unsaved")
    expect(submitButton.disabled).toBe(false)
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.service).toHaveBeenCalledOnce())
    expect(api.service).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
            name: "dev-renamed",
            duration: 8,
            failure_threshold: 3,
            fail_trigger_tasks: [2, 8],
            recover_trigger_tasks: [3, 9],
            skip_servers: { "11": true, "12": true },
            notify: true,
            latency_notify: true,
            enable_trigger_task: true,
            notification_group_id: 1,
        }),
    )
})

test("new service still defaults interval to 30 and threshold to 7; threshold bounds stay enforced", async () => {
    render(<ServiceCard mutate={mutate} />)
    const dialog = await openCard()
    expect(field(dialog, "duration").value).toBe("30")
    expect(field(dialog, "failure_threshold").value).toBe("7")
    fireEvent.change(field(dialog, "name"), { target: { value: "dev-new" } })
    fireEvent.change(field(dialog, "target"), { target: { value: "example.test" } })
    for (const invalid of [0, 101]) {
        fireEvent.change(field(dialog, "failure_threshold"), { target: { value: String(invalid) } })
        await act(async () => submit(dialog))
        expect(api.service).not.toHaveBeenCalled()
    }
    fireEvent.change(field(dialog, "failure_threshold"), { target: { value: "1" } })
    fireEvent.change(field(dialog, "duration"), { target: { value: "0" } })
    await act(async () => submit(dialog))
    expect(api.service).not.toHaveBeenCalled()
    fireEvent.change(field(dialog, "duration"), { target: { value: "1" } })
    fireEvent.change(field(dialog, "failure_threshold"), { target: { value: "100" } })
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.service).toHaveBeenCalledOnce())
    expect(api.service.mock.calls[0][0]).toEqual(
        expect.objectContaining({ duration: 1, failure_threshold: 100 }),
    )
})

test("old service threshold zero still refills as 7", async () => {
    render(<ServiceCard data={{ ...serviceData, failure_threshold: 0 }} mutate={mutate} />)
    const dialog = await openCard()
    expect(field(dialog, "failure_threshold").value).toBe("7")
})

const ddnsData: ModelDDNSProfile = {
    ...fixtureTimes,
    webhook_method: 1,
    webhook_request_type: 1,
    id: 8,
    name: "dev-ddns",
    provider: "dummy",
    max_retries: 3,
    domains: ["dev.example.test", "other.example.test"],
    access_id: "fake-test-id",
    access_secret: "fake-test-secret",
    enable_ipv4: true,
    enable_ipv6: false,
    webhook_url: "",
    webhook_headers: "",
    webhook_request_body: "",
}

test("DDNS refills both credentials exactly and submits unchanged values", async () => {
    render(<DDNSCard data={ddnsData} providers={["dummy"]} mutate={mutate} />)
    const dialog = await openCard()
    expect(field(dialog, "access_id").value).toBe(ddnsData.access_id)
    expect(field(dialog, "access_secret").value).toBe(ddnsData.access_secret)
    expect(field(dialog, "domains_raw").value).toContain("dev.example.test")
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.ddns).toHaveBeenCalledOnce())
    expect(api.ddns).toHaveBeenCalledWith(
        8,
        expect.objectContaining({
            name: ddnsData.name,
            provider: ddnsData.provider,
            max_retries: ddnsData.max_retries,
            domains: ddnsData.domains,
            access_id: ddnsData.access_id,
            access_secret: ddnsData.access_secret,
            enable_ipv4: true,
            enable_ipv6: false,
        }),
    )
})

test("DDNS empty secret and webhook headers remain empty; UI does not substitute a masked value", async () => {
    render(<DDNSCard data={ddnsData} providers={["dummy"]} mutate={mutate} />)
    const dialog = await openCard()
    fireEvent.change(field(dialog, "access_secret"), { target: { value: "" } })
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.ddns).toHaveBeenCalledOnce())
    expect(api.ddns).toHaveBeenCalledWith(
        8,
        expect.objectContaining({
            access_id: ddnsData.access_id,
            access_secret: "",
            webhook_headers: "",
        }),
    )
})

test("advanced alert JSON retains ip_change and offline seconds alongside task and notification values", async () => {
    const data: ModelAlertRule = {
        ...fixtureTimes,
        id: 9,
        name: "dev-alert",
        enable: true,
        rules: [{ type: "offline", duration: 10, cover: 0 }],
        fail_trigger_tasks: [4, 5],
        recover_trigger_tasks: [6, 7],
        notification_group_id: 1,
        trigger_mode: 1,
    }
    render(<AlertRuleCard data={data} mutate={mutate} />)
    const dialog = await openCard()
    expect(dialog.dataset.size).toBe("lg")
    expect(within(dialog).getByText("v2Forms.durationSeconds")).toBeTruthy()
    const textareas = dialog.querySelectorAll("textarea")
    const advanced = [...textareas].find((node) => node.value.includes('"type":"offline"'))!
    const rules = [
        { type: "offline", duration: 10, cover: 0 },
        { type: "ip_change", cover: 0 },
    ]
    fireEvent.change(advanced, { target: { value: JSON.stringify(rules) } })
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.alert).toHaveBeenCalledOnce())
    expect(api.alert).toHaveBeenCalledWith(
        9,
        expect.objectContaining({
            name: data.name,
            enable: true,
            rules,
            fail_trigger_tasks: [4, 5],
            recover_trigger_tasks: [6, 7],
            notification_group_id: 1,
            trigger_mode: 1,
        }),
    )
})

test("cron preserves scheduler, command, server coverage, successful notification and group", async () => {
    const data: ModelCron = {
        ...fixtureTimes,
        cron_job_id: 0,
        last_executed_at: "2026-11-18T00:00:00Z",
        last_result: false,
        id: 10,
        name: "dev-cron",
        task_type: 1,
        scheduler: "0 0 3 * * *",
        command: "printf dev-only",
        servers: [11, 12],
        cover: 1,
        push_successful: true,
        notification_group_id: 1,
    }
    render(<CronCard data={data} mutate={mutate} />)
    const dialog = await openCard()
    expect(dialog.dataset.size).toBe("lg")
    await act(async () => submit(dialog))
    await waitFor(() => expect(api.cron).toHaveBeenCalledOnce())
    expect(api.cron).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
            name: data.name,
            task_type: data.task_type,
            scheduler: data.scheduler,
            command: data.command,
            servers: data.servers,
            cover: data.cover,
            push_successful: true,
            notification_group_id: 1,
        }),
    )
})
