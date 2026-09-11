'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';
import { getDemoCredentials } from '@/services/authService';

export default function SignInPage() {
  const { signIn, error, clearError, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');
    clearError();
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  function fillDemo(type: 'buyer' | 'agent' | 'admin') {
    const creds = getDemoCredentials()[type];
    setEmail(creds.email);
    setPassword(creds.password);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to Hukan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access saved properties, searches and enquiries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="current-password"
          />
        </div>

        {(localError || error) && (
          <p className="text-sm text-danger" role="alert">
            {localError || error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium text-muted-foreground">Demo accounts (development)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('buyer')}>
            Buyer demo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('agent')}>
            Agent demo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('admin')}>
            Admin demo
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          demo@ / agent@ / admin@hukan.co.ke
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
