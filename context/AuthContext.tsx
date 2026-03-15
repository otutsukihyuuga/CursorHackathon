'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as authApi from '@/lib/auth';

interface AuthUser {
  id?: number;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_TOKEN = 'echovoice_token';
const STORAGE_USER = 'echovoice_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_TOKEN) : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_USER) : null;
      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
        if (storedToken) setToken(storedToken);
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    // Backend returns UserRead: { id, username } (no token in OpenAPI)
    const t = (res.token ?? (res as Record<string, unknown>).accessToken) as string | undefined;
    const raw = (res as Record<string, unknown>).user ?? res;
    const u: AuthUser = typeof raw === 'object' && raw && 'username' in raw
      ? { id: (raw as AuthUser).id, username: (raw as AuthUser).username }
      : { username };
    if (t) {
      setToken(t);
      setUser(u);
      localStorage.setItem(STORAGE_TOKEN, t);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    } else {
      setUser(u);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    }
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const res = await authApi.signUp({ username, password });
    const t = (res.token ?? (res as Record<string, unknown>).accessToken) as string | undefined;
    const raw = (res as Record<string, unknown>).user ?? res;
    const u: AuthUser = typeof raw === 'object' && raw && 'username' in raw
      ? { id: (raw as AuthUser).id, username: (raw as AuthUser).username }
      : { username };
    if (t) {
      setToken(t);
      setUser(u);
      localStorage.setItem(STORAGE_TOKEN, t);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    } else {
      setUser(u);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
