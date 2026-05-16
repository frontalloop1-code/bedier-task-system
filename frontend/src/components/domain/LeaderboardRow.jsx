import { Avatar } from '../ui/Avatar.jsx';
import { cn } from '../../lib/cn.js';

const RANK_TONE = {
  1: 'text-tertiary',
  2: 'text-on-surface',
  3: 'text-secondary',
};

export function LeaderboardRow({ rank, name, subtitle, avatar, points, faults, color }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-white/15">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold tabular-nums',
          RANK_TONE[rank] || 'text-on-surface-variant',
        )}
      >
        {rank}
      </div>
      <Avatar src={avatar} name={name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{name}</div>
        {subtitle && (
          <div className="truncate text-xs" style={color ? { color } : { color: 'var(--on-surface-variant)' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-base font-bold tabular-nums text-success">+{points}</span>
        {faults != null && (
          <span className="text-[10px] uppercase tracking-wider text-error/80">
            {faults} faults
          </span>
        )}
      </div>
    </div>
  );
}
