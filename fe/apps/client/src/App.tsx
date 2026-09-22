import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./features/auth/contexts/auth-context";
import { CartProvider } from "./features/cart/contexts/cart-context";
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
