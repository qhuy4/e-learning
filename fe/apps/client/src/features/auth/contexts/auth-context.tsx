import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth.type";
import { logout as doLogout } from "@/shared/lib/axios";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    doLogout();
  }, []);

  useEffect(() => {
    const onTokenUpdated = () => {
      setToken(localStorage.getItem("accessToken"));
    };
    const onLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:token-updated", onTokenUpdated);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:token-updated", onTokenUpdated);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
