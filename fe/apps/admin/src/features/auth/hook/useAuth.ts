import { useSelector } from "react-redux";
import type { RootState } from "@/shared/stores/store";

export function useAuth() {
    return useSelector((state: RootState) => state.auth);
}