import { SidebarInset, SidebarProvider } from "@fe/components/ui/sidebar";
import { AppSidebar } from "@/layout/app-sidebar.tsx";
import { SiteHeader } from "@/components/site-header.tsx";
import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@fe/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          {/* min-w-0: không cho flex nở theo nội dung; overflow-x-auto: trang rộng tự cuộn trong khung, không phá shell */}
          <main className="min-w-0 overflow-x-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
