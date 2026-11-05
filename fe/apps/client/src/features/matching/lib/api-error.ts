import axios from "axios";

/** Đọc message lỗi từ envelope lỗi của backend ({ success:false, error:{...} }). */
export const apiErrorMessage = (err: unknown): string | undefined => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as {
            message?: string | string[];
            error?: { message?: string | string[] };
        };
        const message = data?.error?.message ?? data?.message;
        return Array.isArray(message) ? message.join(", ") : message;
    }
    return undefined;
};
