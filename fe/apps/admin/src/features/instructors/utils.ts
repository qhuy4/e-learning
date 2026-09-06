export function formatDate(date: string | Date | null | undefined) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

export function formatDateTime(date: string | Date | null | undefined) {
    if (!date) return "—"
    return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}
