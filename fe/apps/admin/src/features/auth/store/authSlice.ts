import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {User} from "@/features/auth/types/login.ts";


interface AuthState {
    token: string | null;
    user: User | null;
}

const readStoredAuth = (): AuthState => {
    const token = localStorage.getItem("accessToken");
    if (!token) return { token: null, user: null };

    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
            throw new Error("JWT expired or invalid");
        }
        return { token, user: JSON.parse(localStorage.getItem("user") || "null") };
    } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return { token: null, user: null };
    }
};

const initialState: AuthState = readStoredAuth();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(
            state,
            action: PayloadAction<{
                token: string;
                user: User;
            }>
        ) {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },

        logout(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
        },
    },
});

export const {
    setAuth,
     logout,
} = authSlice.actions;

export default authSlice.reducer;
