import { cn } from '../../lib/cn.js';

const VARIANTS = {
  primary:
    'bg-primary text-on-primary hover:bg-primary/90 shadow-glow-primary disabled:opacity-50',
  secondary:
    'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-glow-secondary disabled:opacity-50',
  tertiary:
    'bg-tertiary text-on-tertiary hover:bg-tertiary/90 shadow-glow-tertiary disabled:opacity-50',
  ghost:
    'bg-white/5 text-on-surface hover:bg-white/10 border border-white/10',
  outline:
    'bg-transparent text-on-surface hover:bg-white/5 border border-white/15',
  danger:
    'bg-error/90 text-on-error hover:bg-error shadow-glow-error',
  success:
    'bg-success text-[#062814] hover:bg-success/90 shadow-glow-success',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  leftIcon,
  rightIcon,
  ...rest
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-ring',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {leftIcon}
      {loading ? <span className="material-symbols animate-spin text-base">progress_activity</span> : null}
      {children}
      {rightIcon}
    </button>
  );
}
