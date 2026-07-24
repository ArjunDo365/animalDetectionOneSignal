// src/context/AuthContext.tsx
//
// Lightweight auth context backed by localStorage. Components use `useAuth()`
// to read the logged-in state and trigger login/logout without touching
// authService directly, keeping a single integration point.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import type { CurrentUser } from "../services/authService";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authService.isLoggedIn(),
  );
  const [user, setUser] = useState<CurrentUser | null>(() =>
    authService.getCurrentUser(),
  );

  // Keep state in sync if another tab logs in/out (storage event).
  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(authService.isLoggedIn());
      setUser(authService.getCurrentUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Must await this — authService.login throws AuthError on bad
    // credentials / network failure / missing token. Letting that
    // propagate up is what allows Login.tsx's try/catch to actually work.
    await authService.login(email, password);

    // Only reached if login succeeded.
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
  }, []);

  const logout = useCallback(async () => {
    // authService.logout calls /api/UserLogout (best-effort) and always
    // clears local session data, even if the API call fails.
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
