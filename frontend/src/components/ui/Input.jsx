import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

export const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, className, ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && (
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </div>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="material-symbols pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-md border border-white/10 bg-surface-container-low px-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition focus-ring',
            'focus:border-primary/60',
            leftIcon && 'pl-10',
            error && 'border-error focus:border-error',
            className,
          )}
          {...rest}
        />
      </div>
      {(error || hint) && (
        <div className={cn('mt-1 text-xs', error ? 'text-error' : 'text-on-surface-variant')}>
          {error || hint}
        </div>
      )}
    </label>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, rows = 4, ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && (
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </div>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-md border border-white/10 bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition focus-ring focus:border-primary/60',
          error && 'border-error focus:border-error',
          className,
        )}
        {...rest}
      />
      {(error || hint) && (
        <div className={cn('mt-1 text-xs', error ? 'text-error' : 'text-on-surface-variant')}>
          {error || hint}
        </div>
      )}
    </label>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, className, children, ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && (
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </div>
      )}
      <select
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-white/10 bg-surface-container-low px-3 text-sm text-on-surface transition focus-ring focus:border-primary/60',
          error && 'border-error focus:border-error',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {(error || hint) && (
        <div className={cn('mt-1 text-xs', error ? 'text-error' : 'text-on-surface-variant')}>
          {error || hint}
        </div>
      )}
    </label>
  );
});
