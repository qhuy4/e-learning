import { useEffect, useState } from "react"

export function useListPage() {
    const [page, setPage] = useState(1)
    const [limit, setLimitState] = useState(10)

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    const [sortBy, setSortBy] = useState("id")
    const [sortOrder, setSortOrder] =
        useState<"asc" | "desc">("asc")

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    // Page size
    const setLimit = (newLimit: number) => {
        setLimitState(newLimit)
        setPage(1)
    }

    // Sorting
    const handleSortChange = (
        newSortBy: string,
        newSortOrder: "asc" | "desc"
    ) => {
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setPage(1)
    }

    return {
        page,
        limit,

        search,
        debouncedSearch,

        sortBy,
        sortOrder,

        setPage,
        setLimit,
        setSearch,
        handleSortChange,
    }
}