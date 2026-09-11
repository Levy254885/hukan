import type { UserRole } from './index';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };
