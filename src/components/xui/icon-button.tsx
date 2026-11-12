import { Button, ButtonProps } from "@/components/ui/button"
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

// Signal: only "add" is a primary action by default; destructive icons are
// tinted, everything else is a quiet outlined button. Callers may still pass
// an explicit variant.
function defaultVariant(icon: IconButtonProps["icon"]): ButtonProps["variant"] {
    if (icon === "plus") return "default"
    if (icon === "trash" || icon === "ban") return "destructive"
    return "outline"
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
    return (
        <Button
            variant={props.variant ?? defaultVariant(props.icon)}
            {...props}
            ref={ref}
            size="icon"
        >
            {(() => {
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
            })()}
        </Button>
    )
})
