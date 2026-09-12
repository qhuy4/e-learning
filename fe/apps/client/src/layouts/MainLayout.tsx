import { Outlet, useNavigate } from "react-router";
import { Header, Footer } from "@fe/components/common";
import { useAuth } from "../features/auth/hooks/use-auth";
import { useCallback } from "react";

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/student/login");
  }, [logout, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
