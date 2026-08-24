import {api} from "@fe/lib/axios.ts";
import type {PaginationResponse} from "@/shared/types/pagination.ts";

export interface User {
    id: number;
    name: string;
    email: string;
}

export const userService = {
    async getUsers(page: number,
                   limit: number,
    ): Promise<PaginationResponse<User>> {
        const response = await api.get<PaginationResponse<User>>("/users/all", {
            params:{
                page,
                limit,
            }
        });
        return response.data;
    },

    async getUser(id: number): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);

        return response.data;
    },

    async createUser(data: {
        name: string;
        email: string;
    }): Promise<User> {
        const response = await api.post<User>("/users", data);

        return response.data;
    },
};