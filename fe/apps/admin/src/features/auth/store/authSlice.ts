import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {User} from "@/features/auth/types/login.ts";


interface AuthState {
    token: string | null;
    user: User | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("accessToken"),
    user: JSON.parse(
        localStorage.getItem("user") || "null"
    ),
};

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