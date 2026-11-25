import { SidebarInset, SidebarProvider } from "@fe/components/ui/sidebar";
import { AppSidebar } from "@/layout/app-sidebar.tsx";
import { SiteHeader } from "@/components/site-header.tsx";
import { Outlet } from "react-router";
import { AppVersion } from "@fe/components/common/AppVersion";

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main>
          <Outlet />
        </main>
      </SidebarInset>
      <AppVersion version={import.meta.env.VITE_APP_VERSION} />
    </SidebarProvider>
  );
}

export default App;
