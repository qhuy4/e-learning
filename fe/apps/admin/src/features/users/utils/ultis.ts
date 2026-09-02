import type {User} from "@/features/users/types/user.type.ts"

export function initials(user: User) {
    const fromProfile = `${user.profile?.firstName?.[0] ?? ""}${user.profile?.lastName?.[0] ?? ""}`
    if (fromProfile.trim()) return fromProfile.toUpperCase()
    return user.name?.slice(0, 2).toUpperCase()
}

export function formatDate(date: Date | string | null | undefined) {
    if (!date) return "—"
    const parsedDate = date instanceof Date ? date : new Date(date)
    return parsedDate.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})
}

export function parseDate(value: | string | null | undefined) {
    if (!value) return undefined

    const [year, month, day] = value.split("-").map(Number)

    const date = new Date(year, month - 1, day)

    return Number.isNaN(date.getTime()) ? undefined : date
}
export function getAvatarUrl(url?: string | null) {
    if (!url) return undefined

    if (url.startsWith("http") || url.startsWith("blob:")) {
        return url
    }

    return `${import.meta.env.VITE_API_URL}${url}`
}