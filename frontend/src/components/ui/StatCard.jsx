import { GlassCard } from './GlassCard.jsx';
import { cn } from '../../lib/cn.js';

export function StatCard({ label, value, icon, delta, tone = 'primary', className }) {
  const toneColor = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    success: 'text-success',
    error: 'text-error',
  }[tone];

  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-on-surface">
            {value}
          </div>
          {delta != null && (
            <div className="mt-1 text-xs text-on-surface-variant">{delta}</div>
          )}
        </div>
        {icon && (
          <span
            className={cn(
              'material-symbols flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-2xl',
              toneColor,
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
