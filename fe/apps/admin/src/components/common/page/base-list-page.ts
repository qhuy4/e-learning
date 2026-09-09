type BaseListPageProps<T> = {
    title: string
    createLabel: string
    columns: any
    data: T[]
    loading: boolean

    page: number
    totalPages: number
    limit: number

    search: string
    sortBy: string
    sortOrder: "asc" | "desc"

    onCreate: () => void
    onRowClick: (item: T) => void

    onPageChange: (page: number) => void
    onSearchChange: (value: string) => void
    onPageSizeChange: (limit: number) => void
    onSortChange: (
        sortBy: string,
        sortOrder: "asc" | "desc"
    )
}