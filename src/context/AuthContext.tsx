import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import {
  AuthUser,
  getMe,
  getToken,
  login as apiLogin,
  register as apiRegister,
  setToken,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  /** true while the stored session is being validated on first load */
  initializing: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, fullName: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (getToken()) {
      getMe()
        .then((u) => {
          if (!cancelled) setUser(u);
        })
        .catch(() => {
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => {
          if (!cancelled) setInitializing(false);
        });
    } else {
      setInitializing(false);
    }

    const onUnauthorized = () => setUser(null);
    window.addEventListener("fluxmedia:unauthorized", onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener("fluxmedia:unauthorized", onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await apiRegister(email, password, fullName);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      /* session expired; the 401 handler clears state */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
