/**
 * Auth Service — abstraction over Firebase Auth (or demo mode).
 * UI never imports Firebase directly.
 */

import type { User, UserRole } from '@/types';
import type { AuthUser } from '@/types/auth';

const DEMO_USERS_KEY = 'hukan_demo_users';
const SESSION_KEY = 'hukan_session';

const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'demo@hukan.co.ke': {
    password: 'demo',
    user: {
      id: 'user_demo',
      email: 'demo@hukan.co.ke',
      displayName: 'Demo Buyer',
      role: 'buyer',
      isVerified: true,
    },
  },
  'agent@hukan.co.ke': {
    password: 'agent',
    user: {
      id: 'agent_demo',
      email: 'agent@hukan.co.ke',
      displayName: 'Demo Agent',
      role: 'agent',
      isVerified: true,
    },
  },
  'admin@hukan.co.ke': {
    password: 'admin',
    user: {
      id: 'admin_demo',
      email: 'admin@hukan.co.ke',
      displayName: 'Demo Admin',
      role: 'admin',
      isVerified: true,
    },
  },
};

function loadSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return loadSession();
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const key = email.toLowerCase().trim();
  const account = DEMO_ACCOUNTS[key];
  if (!account || account.password !== password) {
    throw new Error('Invalid email or password');
  }
  saveSession(account.user);
  return account.user;
}

export async function signUp(input: {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
}): Promise<AuthUser> {
  const key = input.email.toLowerCase().trim();
  if (DEMO_ACCOUNTS[key]) {
    throw new Error('An account with this email already exists');
  }
  const user: AuthUser = {
    id: `user_${Date.now()}`,
    email: key,
    displayName: input.displayName,
    role: input.role || 'buyer',
    isVerified: false,
  };
  // In demo we don't persist new users beyond session
  saveSession(user);
  return user;
}

export async function signOut(): Promise<void> {
  saveSession(null);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<AuthUser, 'displayName' | 'phone' | 'photoURL'>>
): Promise<AuthUser> {
  const current = loadSession();
  if (!current || current.id !== userId) throw new Error('Not signed in');
  const next = { ...current, ...updates };
  saveSession(next);
  return next;
}

export function isAgentRole(role: UserRole): boolean {
  return ['agent', 'agency_admin', 'agency_agent', 'developer', 'developer_staff', 'property_manager'].includes(role);
}

export function isAdminRole(role: UserRole): boolean {
  return ['admin', 'super_admin', 'moderator'].includes(role);
}
