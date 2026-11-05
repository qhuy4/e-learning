import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {adminInstructorService} from "@/features/instructors/service.ts";

export const instructorKeys = {
    all: ["instructors"] as const,
    lists: () => [...instructorKeys.all, "list"] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) =>
        [...instructorKeys.lists(), {page, limit, search, sortBy, sortOrder}] as const,
    details: () => [...instructorKeys.all, "detail"] as const,
    detail: (id: number) => [...instructorKeys.details(), id] as const,
}

export function useInstructors(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) {
    return useQuery({
        queryKey: instructorKeys.list(page, limit, search, sortBy, sortOrder),
        queryFn: () => adminInstructorService.getInstructors(page, limit, search, sortBy, sortOrder),
    })
}

export function useInstructor(id: number) {
    return useQuery({
        queryKey: instructorKeys.detail(id),
        queryFn: () => adminInstructorService.getInstructor(id),
        enabled: id > 0,
    })
}

export function useUpdateInstructor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: {
                name?: string;
                email?: string;
                status?: string;
                headline?: string | null;
                bio?: string | null;
                websiteUrl?: string | null;
                socialLinks?: Record<string, string> | null;
            }
        }) => adminInstructorService.updateInstructor(id, data),

        onSuccess: (_result, variables) => {
            void queryClient.invalidateQueries({
                queryKey: instructorKeys.lists(),
            })

            void queryClient.invalidateQueries({
                queryKey: instructorKeys.detail(variables.id),
            })
        },
    })
}

