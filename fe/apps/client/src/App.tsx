import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./features/auth/contexts/auth-context";
import { I18nProvider } from "./i18n/i18n-provider";
import { ThemeProvider } from "./components/theme-provider";
import { AppRouter } from "./routes";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    return (
        <ThemeProvider>
            <I18nProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <AppRouter />
                        <Toaster position="top-right" richColors />
                    </AuthProvider>
                </QueryClientProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}
