import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/stores/store";

export function PublicRoute() {
    const token = useSelector((state: RootState) => state.auth.token);
    if (token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}
