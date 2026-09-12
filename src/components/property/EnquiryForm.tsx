'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { startOrGetConversation } from '@/services/messagingService';

interface EnquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  agentPhone?: string;
  className?: string;
  onSuccess?: () => void;
}

export function EnquiryForm({
  propertyId,
  propertyTitle,
  className,
  onSuccess,
}: EnquiryFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    `Hello, I'm interested in "${propertyTitle}". Is it still available?`
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Name and phone number are required.');
      return;
    }

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setStatus('loading');

    try {
      await new Promise((r) => setTimeout(r, 400));
      if (user) {
        await startOrGetConversation({
          userId: user.id,
          agentId: 'agent_001',
          propertyId,
          propertyTitle,
          initialMessage: message,
        });
      }
      setStatus('success');
      onSuccess?.();
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or use WhatsApp.');
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('rounded-lg border border-success/30 bg-success/5 p-4 text-center', className)}>
        <p className="font-medium text-success">Enquiry sent</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The agent will contact you shortly. You can also reach them on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div>
        <label htmlFor="enq-name" className="mb-1 block text-sm font-medium">
          Full name *
        </label>
        <input
          id="enq-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Jane Wanjiku"
        />
      </div>

      <div>
        <label htmlFor="enq-phone" className="mb-1 block text-sm font-medium">
          Phone number *
        </label>
        <input
          id="enq-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="07XX XXX XXX or +254..."
        />
      </div>

      <div>
        <label htmlFor="enq-email" className="mb-1 block text-sm font-medium">
          Email (optional)
        </label>
        <input
          id="enq-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="enq-message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="enq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-danger" role="alert">
          {errorMsg}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Enquiry'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By sending you agree to be contacted about this property.
      </p>
    </form>
  );
}
