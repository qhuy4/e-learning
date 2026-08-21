// features/user/types/user.types.ts

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface UserListResponse {
    data: User[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}