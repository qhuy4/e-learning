import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fe/style/global.css"
import {router} from "@/router";
import {RouterProvider} from "react-router";
import {Toaster} from "sonner";

const root = document.documentElement;
import { Provider } from "react-redux";
import {store} from "@/shared/stores/store.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
        },
    },
});
root.classList.add("dark");
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    defaultTheme="dark"
                    storageKey="vite-ui-theme"
                >
                    <RouterProvider router={router} />
                    <Toaster richColors position="top-right" />
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)
