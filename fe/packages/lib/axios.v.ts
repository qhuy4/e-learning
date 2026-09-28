import axios from "axios";

export const createApi = (
    getToken: () => string | null,
    prefix = "",
) => {
    const apiOrigin = import.meta.env.VITE_API_URL
        || `${window.location.protocol}//${window.location.hostname}:3001`;

    const api = axios.create({
        baseURL: `${apiOrigin.replace(/\/$/, "")}${prefix}`,
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
