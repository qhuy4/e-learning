import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {userService} from "@/features/users/service"
import type {UserWriteInput} from "@/features/users/types/user.type"

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) =>
        [...userKeys.lists(), {page, limit, search, sortBy, sortOrder}] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: number) => [...userKeys.details(), id] as const,
}

export function useUsers(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) {
    return useQuery({
        queryKey: userKeys.list(page, limit, search, sortBy, sortOrder),
        queryFn: () => userService.getUsers(page, limit, search, sortBy, sortOrder),
    })
}

export function useUser(id: number) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getUser(id),
        enabled: id > 0,
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UserWriteInput) => userService.createUser(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: userKeys.lists()})
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
                queryKey: userKeys.lists(),
            })

            void queryClient.invalidateQueries({
                queryKey: userKeys.detail(variables.id),
            })
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userService.deleteUser(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: userKeys.all})
        },
    })
}

export function useBlockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, reason}: { id: number; reason: string }) =>
            userService.blockUser(id, reason),
        onSuccess: (_result, variables) => {
            void queryClient.invalidateQueries({queryKey: userKeys.lists()})
            void queryClient.invalidateQueries({queryKey: userKeys.detail(variables.id)})
        },
    })
}

export function useUnblockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userService.unblockUser(id),
        onSuccess: (_result, variables) => {
            void queryClient.invalidateQueries({queryKey: userKeys.lists()})
            void queryClient.invalidateQueries({queryKey: userKeys.detail(variables)})
        },
    })
}
