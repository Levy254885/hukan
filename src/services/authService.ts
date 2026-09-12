/**
 * Auth Service — abstraction over Firebase Auth (or demo mode).
 * UI never imports Firebase directly.
 */

import type { AuthUser } from '@/types/auth';
import type { UserRole } from '@/types';

const DEMO_STORAGE_KEY = 'hukan_demo_user';

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'demo@hukan.co.ke': {
    password: 'demo1234',
    user: {
      id: 'user_demo_001',
      email: 'demo@hukan.co.ke',
      displayName: 'Demo User',
      phone: '+254712345678',
      photoURL: null,
      role: 'buyer',
      emailVerified: true,
      createdAt: new Date('2026-01-15'),
    },
  },
  'agent@hukan.co.ke': {
    password: 'agent1234',
    user: {
      id: 'user_agent_001',
      email: 'agent@hukan.co.ke',
      displayName: 'Jane Wanjiku',
      phone: '+254722334455',
      photoURL: null,
      role: 'agent',
      emailVerified: true,
      createdAt: new Date('2025-11-01'),
    },
  },
  'admin@hukan.co.ke': {
    password: 'admin1234',
    user: {
      id: 'user_admin_001',
      email: 'admin@hukan.co.ke',
      displayName: 'Hukan Admin',
      phone: '+254700000000',
      photoURL: null,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date('2025-06-01'),
    },
  },
};

function loadDemoUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, createdAt: new Date(parsed.createdAt) };
  } catch {
    return null;
  }
}

function saveDemoUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return loadDemoUser();
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  const key = email.toLowerCase().trim();
  const entry = DEMO_USERS[key];

  if (!entry || entry.password !== password) {
    throw new Error('Invalid email or password');
  }

  saveDemoUser(entry.user);
  return entry.user;
}

export const signIn = signInWithEmail;

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'buyer'
): Promise<AuthUser> {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');\n  }

  const key = email.toLowerCase().trim();
  if (DEMO_USERS[key]) {
    throw new Error('An account with this email already exists');
  }

  const user: AuthUser = {
    id: `user_${Date.now()}`,
    email: key,
    displayName: displayName.trim() || null,
    phone: null,
    photoURL: null,
    role,
    emailVerified: false,
    createdAt: new Date(),
  };

  saveDemoUser(user);
  return user;
}

export const signUp = signUpWithEmail;

export async function signOut(): Promise<void> {
  saveDemoUser(null);
}

export async function updateProfile(
  updates: Partial<Pick<AuthUser, 'displayName' | 'phone' | 'photoURL'>>
): Promise<AuthUser> {
  const current = loadDemoUser();
  if (!current) throw new Error('Not authenticated');

  const updated = { ...current, ...updates };
  saveDemoUser(updated);
  return updated;
}

/** Demo credentials helper for UI */
export function getDemoCredentials() {
  return {
    buyer: { email: 'demo@hukan.co.ke', password: 'demo1234' },
    agent: { email: 'agent@hukan.co.ke', password: 'agent1234' },
    admin: { email: 'admin@hukan.co.ke', password: 'admin1234' },
  };
}

export function isAgentRole(role: UserRole): boolean {
  return [
    'agent',
    'agency_admin',
    'agency_agent',
    'developer',
    'developer_staff',
    'property_manager',
  ].includes(role);
}

export function isAdminRole(role: UserRole): boolean {
  return ['admin', 'super_admin', 'moderator'].includes(role);
}
