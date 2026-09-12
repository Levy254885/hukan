'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@/types/auth';
import type { UserRole } from '@/types';
import * as authService from '@/services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role?: UserRole
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<AuthUser, 'displayName' | 'phone' | 'photoURL'>>
  ) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const u = await authService.signInWithEmail(email, password);
      setUser(u);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign in failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole = 'buyer'
    ) => {
      setError(null);
      setLoading(true);
      try {
        const u = await authService.signUpWithEmail(
          email,
          password,
          displayName,
          role
        );
        setUser(u);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Sign up failed';
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<AuthUser, 'displayName' | 'phone' | 'photoURL'>>
    ) => {
      const u = await authService.updateProfile(updates);
      setUser(u);
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      clearError,
    }),
    [user, loading, error, signIn, signUp, signOut, updateProfile, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
