"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getSession, setSession, clearSession, type Session } from "./auth";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  login: (s: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionState(getSession());
    setLoading(false);
  }, []);

  const login = useCallback((s: Session) => {
    setSession(s);
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
