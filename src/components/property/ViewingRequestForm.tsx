'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewingRequestFormProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
  onSuccess?: () => void;
}

export function ViewingRequestForm({
  propertyId,
  propertyTitle,
  className,
  onSuccess,
}: ViewingRequestFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim() || !preferredDate) {
      setErrorMsg('Name, phone and preferred date are required.');
      return;
    }

    setStatus('loading');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStatus('success');
      onSuccess?.();
    } catch {
      setStatus('error');
      setErrorMsg('Could not submit request. Please try WhatsApp instead.');
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('rounded-lg border border-success/30 bg-success/5 p-4 text-center', className)}>
        <p className="font-medium text-success">Viewing requested</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The agent will confirm the time with you shortly.
        </p>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div>
        <label htmlFor="view-name" className="mb-1 block text-sm font-medium">
          Full name *
        </label>
        <input
          id="view-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="view-phone" className="mb-1 block text-sm font-medium">
          Phone number *
        </label>
        <input
          id="view-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="07XX XXX XXX"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="view-date" className="mb-1 block text-sm font-medium">
            Preferred date *
          </label>
          <input
            id="view-date"
            type="date"
            value={preferredDate}
            min={minDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="view-time" className="mb-1 block text-sm font-medium">
            Preferred time
          </label>
          <select
            id="view-time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="view-message" className="mb-1 block text-sm font-medium">
          Additional notes
        </label>
        <textarea
          id="view-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Any special requirements?"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-danger" role="alert">
          {errorMsg}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting…' : 'Request Viewing'}
      </Button>
    </form>
  );
}
