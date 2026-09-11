import Link from 'next/link';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center animate-[fade-in_0.35s_ease-out]',
        className
      )}
    >
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5 inline-block">
          <Button variant="outline" size="sm">
            {actionLabel}
          </Button>
        </Link>
      )}
      {children}
    </div>
  );
}
