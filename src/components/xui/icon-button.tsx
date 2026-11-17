import { usePageHeaderActions } from "@/components/page"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import {
    BanIcon,
    Check,
    CircleArrowUp,
    Clipboard,
    CogIcon,
    Download,
    Edit2,
    Expand,
    FolderClosed,
    Menu,
    Minus,
    MoreHorizontal,
    Play,
    Plus,
    Terminal,
    Trash2,
    Upload,
    UserPen,
} from "lucide-react"
import { forwardRef } from "react"

export interface IconButtonProps extends ButtonProps {
    icon:
        | "clipboard"
        | "check"
        | "edit"
        | "trash"
        | "plus"
        | "terminal"
        | "update"
        | "folder-closed"
        | "play"
        | "download"
        | "upload"
        | "menu"
        | "ban"
        | "expand"
        | "cog"
        | "minus"
        | "user-pen"
        | "more"
}

// 仅新增操作默认强调；行内操作为 Ghost，调用方显式 variant 仍生效。
function defaultVariant(icon: IconButtonProps["icon"]): ButtonProps["variant"] {
    if (icon === "plus") return "default"
    return "ghost"
}

const iconLabelKeys: Record<IconButtonProps["icon"], string> = {
    clipboard: "Copy",
    check: "Confirm",
    edit: "v2Shell.actions.edit",
    trash: "Delete",
    plus: "Add",
    terminal: "Terminal",
    update: "v2Shell.actions.update",
    "folder-closed": "v2Shell.actions.openFolder",
    play: "v2Shell.actions.run",
    download: "v2Shell.actions.download",
    upload: "v2Shell.actions.upload",
    menu: "v2Shell.actions.menu",
    ban: "v2Shell.actions.block",
    expand: "v2Shell.actions.expand",
    cog: "Settings",
    minus: "v2Shell.actions.remove",
    "user-pen": "v2Shell.actions.editOwner",
    more: "v2Shell.actions.more",
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
    const { t } = useTranslation()
    const headerCreate = usePageHeaderActions() && props.icon === "plus"
    const hasChildren = props.children !== undefined && props.children !== null
    const nonEmpty = (value?: string) => value?.trim() ? value : undefined
    const label = nonEmpty(props["aria-label"]) ?? nonEmpty(props.title)
        ?? (hasChildren ? undefined : t(iconLabelKeys[props.icon]))
    const icon = (() => {
                switch (props.icon) {
                    case "clipboard": {
                        return <Clipboard />
                    }
                    case "check": {
                        return <Check />
                    }
                    case "edit": {
                        return <Edit2 />
                    }
                    case "trash": {
                        return <Trash2 />
                    }
                    case "plus": {
                        return <Plus />
                    }
                    case "terminal": {
                        return <Terminal />
                    }
                    case "update": {
                        return <CircleArrowUp />
                    }
                    case "folder-closed": {
                        return <FolderClosed />
                    }
                    case "play": {
                        return <Play />
                    }
                    case "download": {
                        return <Download />
                    }
                    case "upload": {
                        return <Upload />
                    }
                    case "menu": {
                        return <Menu />
                    }
                    case "ban": {
                        return <BanIcon />
                    }
                    case "expand": {
                        return <Expand />
                    }
                    case "cog": {
                        return <CogIcon />
                    }
                    case "minus": {
                        return <Minus />
                    }
                    case "user-pen": {
                        return <UserPen />
                    }
                    case "more": {
                        return <MoreHorizontal />
                    }
                }
    })()
    return (
        <Button
            variant={props.variant ?? defaultVariant(props.icon)}
            {...props}
            ref={ref}
            aria-label={label}
            size={headerCreate ? "default" : "icon"}
            className={cn(props.className, headerCreate && "sh-header-create")}
        >
            {props.asChild && hasChildren ? props.children : <>{icon}{hasChildren ? props.children : headerCreate ? t("Add") : null}</>}
        </Button>
    )
})
