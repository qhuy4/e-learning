export interface User {
    id: number;
    email: string;
    name: string;
    avatar: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    data: {
        accessToken: string;
        user: User
    };
    meta: null;
    success: boolean;
}