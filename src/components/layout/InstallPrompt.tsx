'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'hukan_pwa_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-border bg-card p-4 shadow-lift md:left-auto md:right-6 md:max-w-sm md:bottom-6">
      <p className="font-semibold text-foreground">Install Hukan</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Faster access to searches, saved homes and alerts.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await deferred.prompt();
            setVisible(false);
          }}
        >
          Install
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1');
            setVisible(false);
          }}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
