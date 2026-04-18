import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch } from './api';
import type { AuthResponse, MeResponse, SessionUser } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  login: (input: { identifier: string; password: string }) => Promise<SessionUser>;
  signup: (input: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  }) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<SessionUser | null>;
  setUser: (user: SessionUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUserState] = useState<SessionUser | null>(null);

  useEffect(() => {
    void apiFetch<MeResponse>('/auth/me')
      .then((response) => {
        startTransition(() => {
          setUserState(response.user);
          setStatus('authenticated');
        });
      })
      .catch(() => {
        startTransition(() => {
          setUserState(null);
          setStatus('guest');
        });
      });
  }, []);

  async function login(input: { identifier: string; password: string }) {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    startTransition(() => {
      setUserState(response.user);
      setStatus('authenticated');
    });

    return response.user;
  }

  async function signup(input: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  }) {
    const response = await apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    startTransition(() => {
      setUserState(response.user);
      setStatus('authenticated');
    });

    return response.user;
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Clear the client state even if the server call fails.
    }

    startTransition(() => {
      setUserState(null);
      setStatus('guest');
    });
  }

  async function refresh() {
    try {
      const response = await apiFetch<MeResponse>('/auth/me');
      startTransition(() => {
        setUserState(response.user);
        setStatus('authenticated');
      });

      return response.user;
    } catch {
      startTransition(() => {
        setUserState(null);
        setStatus('guest');
      });

      return null;
    }
  }

  function setUser(nextUser: SessionUser | null) {
    setUserState(nextUser);
    setStatus(nextUser ? 'authenticated' : 'guest');
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login,
      signup,
      logout,
      refresh,
      setUser,
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
