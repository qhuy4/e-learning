import { api } from "@fe/lib/axios.ts";

export interface User {
    id: number;
    name: string;
    email: string;
}

export const userService = {
    async getUsers(): Promise<User[]> {
        const response = await api.get<User[]>("/users/all");
        console.log(response.data);
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