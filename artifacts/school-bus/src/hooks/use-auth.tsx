import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "schoolbus.auth";
const ADMIN_USER = "admin";
const ADMIN_PASS = "GyanFactory";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated]);

  const login = (username: string, password: string) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
