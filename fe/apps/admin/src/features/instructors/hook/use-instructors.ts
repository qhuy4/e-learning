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
                headline?: string;
                bio?: string;
                websiteUrl?: string;
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

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UserWriteInput) => userService.createUser(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: instructorKeys.lists()})
        },
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: UserWriteInput
        }) => userService.updateUser(id, data),

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

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userService.deleteUser(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: instructorKeys.all})
        },
    })
}

export function useBlockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, reason}: { id: number; reason: string }) =>
            userService.blockUser(id, reason),
        onSuccess: (_result, variables) => {
            void queryClient.invalidateQueries({queryKey: instructorKeys.lists()})
            void queryClient.invalidateQueries({queryKey: instructorKeys.detail(variables.id)})
        },
    })
}

export function useUnblockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userService.unblockUser(id),
        onSuccess: (_result, variables) => {
            void queryClient.invalidateQueries({queryKey: instructorKeys.lists()})
            void queryClient.invalidateQueries({queryKey: instructorKeys.detail(variables)})
        },
    })
}
