import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {reviewService} from "@/features/reviews/service"

export const reviewKeys = {
    all: ["reviews"] as const,
    lists: () => [...reviewKeys.all, "list"] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) =>
        [...reviewKeys.lists(), {page, limit, search, sortBy, sortOrder}] as const,
    details: () => [...reviewKeys.all, "detail"] as const,
    detail: (id: string) => [...reviewKeys.details(), id] as const,
}

export function useReviews(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) {
    return useQuery({
        queryKey: reviewKeys.list(page, limit, search, sortBy, sortOrder),
        queryFn: () => reviewService.getReviews(page, limit, search, sortBy, sortOrder),
    })
}

export function useReview(id: string) {
    return useQuery({
        queryKey: reviewKeys.detail(id),
        queryFn: () => reviewService.getReview(id),
        enabled: !!id,
    })
}

export function useUpdateReviewStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, status}: {id: string; status: number}) =>
            reviewService.updateStatus(id, status),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({queryKey: reviewKeys.lists()})
            void queryClient.invalidateQueries({queryKey: reviewKeys.detail(variables.id)})
        },
    })
}
