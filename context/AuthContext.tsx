"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api";
import { User } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // on mount, ask the backend "who am I?" — the cookie is invisible to JS,
  // so the only way to know is to call /users/me and let the browser send it
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api<User>("/users/me");
        if (active) setUser(me);
      } catch (err) {
        // 401 just means not logged in — not a real error
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function login(email: string, password: string) {
    // backend sets the cookie in its response; we then fetch the user
    await api("/auth/login", { method: "POST", json: { email, password } });
    const me = await api<User>("/users/me");
    setUser(me);
  }

  async function register(data: {
    username: string;
    email: string;
    password: string;
  }) {
    // your register endpoint logs the user in (sets cookie) and returns user
    await api("/auth/register", { method: "POST", json: data });
    const me = await api<User>("/users/me");
    setUser(me);
  }

  async function logout() {
    // NOTE: backend needs a logout endpoint that clears the cookie — see below
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // even if the call fails, clear local state
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
