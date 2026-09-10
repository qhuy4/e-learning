import { Outlet } from "react-router";
import { Header, Footer } from "@fe/components/common";
import { useAuth } from "../features/auth/hooks/use-auth";

export const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
