'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter';
import { WebVitalsDebug } from '@/components/performance/WebVitalsDebug';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Suspense fallback={null}>
        <WebVitalsReporter />
      </Suspense>
      <WebVitalsDebug />
    </AuthProvider>
  );
}
