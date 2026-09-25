import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from "axios";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const createApi = (
    getToken: () => string | null,
    setToken: (token: string) => void,
    logout: () => void,
    prefix = "",
    refreshPath = "",
): AxiosInstance => {
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_API_URL}${prefix}`,
        withCredentials: true,
    });

    let refreshPromise: Promise<string> | null = null;

    async function refreshAccessToken(): Promise<string> {
        const response = await refreshClient.post<{
            data: { accessToken: string };
        }>(refreshPath);
        const newAccessToken = response.data.data.accessToken;

        setToken(newAccessToken);
        return newAccessToken;
    }
    // Request interceptor
    api.interceptors.request.use((config) => {


        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    // Response interceptor
    api.interceptors.response.use(
        (response) => response,

        async (error) => {
            const originalRequest =
                error.config as RetryableRequestConfig;

            if (
                error.response?.status !== 401 ||
                originalRequest._retry
            ) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => {
                        refreshPromise = null;
                    });
                }

                const newAccessToken = await refreshPromise;

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.log('REFRESH FAILED:', refreshError);

                logout();

                return Promise.reject(refreshError);
            }
        },
    );

    return api;
};