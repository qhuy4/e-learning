import type {PaginationResponse} from "@/shared/types/pagination.ts";
import type {User, UserWriteInput} from "@/features/users/types/user.type.ts";
import {adminApi} from "@/shared/lib/axios.ts";

export const userService = {
    async getUsers(page: number,
        limit: number,
        search?: string,
        sortBy?: string,
        sortOrder?: string,
        role?: string,
    ): Promise<PaginationResponse<User>> {
        const response = await adminApi.get<PaginationResponse<User>>("/users/", {
            params: {
                page,
                limit,
                ...(search && {search}),
                ...(sortBy && {sortBy}),
                ...(sortOrder && {sortOrder}),
                ...(role && {role}),
            }
        });
        return response.data;
    },

    async getUser(id: number): Promise<User> {
        const response = await adminApi.get<User>(`/users/${id}`);

        return response.data.data;
    },

    async createUser(data: {
        name: string;
        email: string;
    }): Promise<User> {
        const response = await adminApi.post<User>("/users", data);

        return response.data;
    },
    async updateUser(
        id: number,
        data: UserWriteInput,
    ): Promise<User> {
        const formData = new FormData()

        formData.append("name", data.name)
        formData.append("email", data.email)
        formData.append("status", data.status)
        formData.append("role", data.role)
        formData.append("block_reason", data.block_reason ?? "")

        formData.append(
            "profile",
            JSON.stringify(data.profile),
        )

        if (data.avatarFile) {
            formData.append("avatar", data.avatarFile)
        }

        const response = await adminApi.patch<User>(
            `/users/${id}`,
            formData,
        )

        return response.data
    },
    async blockUser(id: number, reason: string): Promise<User> {
        const response = await adminApi.post<User>(
            `/users/${id}/block`,
            {reason}
        )

        return response.data
    },

    async unblockUser(id: number): Promise<User> {
        const response = await adminApi.post<User>(
            `/users/${id}/unblock`
        )

        return response.data
    },
};