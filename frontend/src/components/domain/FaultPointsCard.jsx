import { GlassCard } from '../ui/GlassCard.jsx';
import { cn } from '../../lib/cn.js';

export function FaultPointsCard({ used = 0, max = 4, warningLevel = 0, className }) {
  const limit = Math.max(1, Number(max) || 1);
  const usedClamped = Math.min(used, limit);
  const pct = Math.round((usedClamped / limit) * 100);

  const tone =
    used >= limit
      ? { bar: 'bg-error', text: 'text-error', glow: 'shadow-glow-error', label: 'Limit reached' }
      : pct >= 75
        ? { bar: 'bg-error', text: 'text-error', glow: 'shadow-glow-error', label: 'Critical' }
        : pct >= 50
          ? { bar: 'bg-tertiary', text: 'text-tertiary', glow: 'shadow-glow-tertiary', label: 'Warning' }
          : { bar: 'bg-success', text: 'text-success', glow: 'shadow-glow-success', label: 'Healthy' };

  return (
    <GlassCard className={cn('p-5', className)} accent={used >= limit ? 'error' : undefined}>
      <div className="flex items-start justify-between">
        <div>
          <div className="label-caps">Fault points</div>
          <div className={cn('mt-1 text-3xl font-bold tabular-nums', tone.text)}>
            {used}
            <span className="ml-1 text-base font-medium text-on-surface-variant">
              of {limit} Used
            </span>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            used >= limit
              ? 'border-error/40 bg-error/15 text-error'
              : pct >= 50
                ? 'border-tertiary/40 bg-tertiary/15 text-tertiary'
                : 'border-success/40 bg-success/15 text-success',
          )}
        >
          <span className="material-symbols text-[14px]">
            {used >= limit ? 'warning' : pct >= 50 ? 'warning_amber' : 'check_circle'}
          </span>
          {tone.label}
        </span>
      </div>

      {/* Segmented progress bar — one segment per fault slot */}
      <div className="mt-4 flex gap-1">
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full transition',
              i < usedClamped
                ? cn(tone.bar, tone.glow)
                : 'bg-white/5',
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">
          {Math.max(0, limit - used)} remaining
        </span>
        {warningLevel > 0 && (
          <span className="rounded-full border border-error/40 bg-error/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-error">
            Warning level {warningLevel}
          </span>
        )}
      </div>

      {used >= limit && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-error/30 bg-error/10 p-3">
          <span className="material-symbols text-error">notifications_active</span>
          <div className="text-xs text-on-surface">
            <div className="font-bold text-error">Performance alert</div>
            <div className="text-on-surface-variant">
              You've reached the fault points limit. Contact your team lead to resolve.
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
