import axios from "axios";

export const createApi = (
    getToken: () => string | null,
    prefix = "",
) => {
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_API_URL}${prefix}`,
    })

    api.interceptors.request.use((config) => {
        const token = getToken()

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    })

    return api
}