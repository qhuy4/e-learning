import {useQuery} from "@tanstack/react-query"
import {studentService} from "@/features/students/service"

export const studentKeys = {
    all: ["students"] as const,
    lists: () => [...studentKeys.all, "list"] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) =>
        [...studentKeys.lists(), {page, limit, search, sortBy, sortOrder}] as const,
}

export function useStudents(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) {
    return useQuery({
        queryKey: studentKeys.list(page, limit, search, sortBy, sortOrder),
        queryFn: () => studentService.getStudents(page, limit, search, sortBy, sortOrder),
    })
}
