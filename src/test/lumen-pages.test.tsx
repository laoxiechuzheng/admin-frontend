import { selectableTableFeatures } from "@/lib/table"
import { mobileColumns } from "@/routes/lumen-page-parts"
import { ColumnDef } from "@tanstack/react-table"
import { expect, test, vi } from "vitest"

// 本文件只检查本块列元数据，不加载并行改写中的共用按钮/表格组件。
vi.mock("@/components/copy-button", () => ({ CopyButton: () => null }))
vi.mock("@/components/ui/button", () => ({ Button: () => null }))
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

type Item = { id: number; name: string; uuid: string }
type Column = ColumnDef<typeof selectableTableFeatures, Item>

test("mobile columns choose the name, preserve selection/actions and keep UUID metadata visible", () => {
    const select: Column = { id: "select", header: () => "select", cell: () => "checkbox" }
    const actions: Column = { id: "actions", cell: () => "actions" }
    const source: Column[] = [
        select,
        { accessorKey: "id", header: "ID" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "uuid", header: "UUID" },
        actions,
    ]
    const result = mobileColumns(source, "name", ["uuid"])
    expect(result[0]).toBe(select)
    expect(result[4]).toBe(actions)
    expect(result[2].meta).toMatchObject({ mobile: "title", label: "Name" })
    expect(result[1].meta).toMatchObject({ mobile: "meta", label: "ID" })
    expect(result[3].meta).toMatchObject({ mobile: "meta", label: "UUID", span: "full" })
    expect(result.filter((column) => column.meta?.mobile === "hide")).toEqual([])
    expect(source[2].meta).toBeUndefined()
})

test("mobile columns never stringify function or ReactNode headers and preserve explicit labels", () => {
    const result = mobileColumns<Item>(
        [
            { id: "name", header: () => "Name", meta: { label: "Host name" } },
            { id: "node", header: (<span>Node</span>) as never },
            { id: "fn", header: () => "Function" },
        ],
        "name",
    )
    expect(result[0].meta?.label).toBe("Host name")
    expect(result[1].meta?.label).toBeUndefined()
    expect(result[2].meta?.label).toBeUndefined()
    expect(result.some((column) => column.meta?.label === "[object Object]")).toBe(false)
})

test("mobile columns leave accessors and existing cell actions unchanged", () => {
    const accessorFn = (row: Item) => row.uuid
    const cell = () => <button>Copy</button>
    const result = mobileColumns<Item>([{ id: "uuid", header: "UUID", accessorFn, cell }], "uuid")
    expect(result[0].cell).toBe(cell)
    expect("accessorFn" in result[0] && result[0].accessorFn).toBe(accessorFn)
    expect(result[0].meta?.mobile).toBe("title")
})
