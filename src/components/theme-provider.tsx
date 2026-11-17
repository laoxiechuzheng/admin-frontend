import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"
type ThemeProviderProps = { children: React.ReactNode; defaultTheme?: Theme; storageKey?: string }
type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void }
const ThemeProviderContext = createContext<ThemeProviderState>({ theme: "system", setTheme: () => null })

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored === "dark" || stored === "light" || stored === "system") return stored
        } catch { /* 存储不可用仍可切换当前会话。 */ }
        return defaultTheme
    })
    useEffect(() => {
        const root = document.documentElement
        const media = window.matchMedia("(prefers-color-scheme: dark)")
        const apply = () => {
            const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme
            root.classList.remove("light", "dark")
            root.classList.add(resolved)
            let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
            if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta) }
            meta.content = resolved === "dark" ? "#070B14" : "#EDF0F8"
        }
        apply()
        if (theme === "system") {
            media.addEventListener("change", apply)
            return () => media.removeEventListener("change", apply)
        }
    }, [theme])
    const value = { theme, setTheme: (next: Theme) => {
        try { localStorage.setItem(storageKey, next) } catch { /* 保留内存偏好。 */ }
        setTheme(next)
    } }
    return <ThemeProviderContext.Provider {...props} value={value}>{children}</ThemeProviderContext.Provider>
}
export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
