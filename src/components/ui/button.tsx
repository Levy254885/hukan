import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ' +
      'transition-all duration-200 ease-out ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:pointer-events-none disabled:opacity-50 ' +
      'active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md focus-visible:ring-primary',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary',
      outline:
        'border border-border bg-background shadow-sm hover:bg-muted hover:border-border/80 focus-visible:ring-ring',
      ghost: 'hover:bg-muted focus-visible:ring-ring',
      accent:
        'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-md focus-visible:ring-accent',
      danger:
        'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90 focus-visible:ring-danger',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
