import { SidebarInset, SidebarProvider } from "@fe/components/ui/sidebar";
import { AppSidebar } from "@/layout/app-sidebar.tsx";
import { SiteHeader } from "@/components/site-header.tsx";
import { Outlet } from "react-router";

function App() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
