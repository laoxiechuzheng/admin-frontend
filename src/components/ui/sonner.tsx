import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()
    const [mobile, setMobile] = useState(() => window.innerWidth < 768)
    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)")
        const update = () => setMobile(media.matches)
        update()
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [])

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position={mobile ? "top-center" : "bottom-right"}
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-overlay group-[.toaster]:rounded-[14px] group-[.toaster]:text-[13px]",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
