import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fe/style/global.css"
import {router} from "@/router";
import {RouterProvider} from "react-router";
const root = document.documentElement;
import { Provider } from "react-redux";
import {store} from "@/shared/stores/store.ts";

import { ThemeProvider } from "@/components/theme-provider";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    </StrictMode>,
)