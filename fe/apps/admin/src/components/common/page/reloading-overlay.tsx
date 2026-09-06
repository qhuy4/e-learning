import {RefreshCw} from "lucide-react"

interface ReloadingOverlayProps {
    isFetching: boolean
}

export function ReloadingOverlay({isFetching}: ReloadingOverlayProps) {
    if (!isFetching) return null

    return (
        <div className="absolute inset-0 z-10 bg-background/60 flex items-start justify-center pt-24">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-md">
                <RefreshCw className="size-4 animate-spin"/>
                <span className="text-sm text-muted-foreground">Reloading...</span>
            </div>
        </div>
    )
}
