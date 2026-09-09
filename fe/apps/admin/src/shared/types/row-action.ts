import type { LucideIcon } from "lucide-react"

export type RowAction<T> = {
    label: string
    icon?: LucideIcon
    onClick: (item: T) => void
    variant?: "default" | "destructive"
    hidden?: (item: T) => boolean
    disabled?: (item: T) => boolean
}