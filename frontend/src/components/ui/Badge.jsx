import { cn } from '../../lib/cn.js';

const TONE = {
  primary: 'bg-primary/15 text-primary border-primary/30',
  secondary: 'bg-secondary/15 text-secondary border-secondary/30',
  tertiary: 'bg-tertiary/15 text-tertiary border-tertiary/30',
  success: 'bg-success/15 text-success border-success/30',
  error: 'bg-error/15 text-error border-error/30',
  neutral: 'bg-white/10 text-on-surface-variant border-white/15',
};

export function Badge({ tone = 'neutral', className, children, dot, icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        TONE[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', `bg-${tone}`)} />}
      {icon && <span className="material-symbols text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}

export function NeonBadge({ value, tone = 'success', className }) {
  const cls = TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums',
        cls,
        className,
      )}
    >
      {value > 0 ? '+' : ''}
      {value}
    </span>
  );
}

export function StatusPill({ status }) {
  const map = {
    APPROVED: { tone: 'success', label: 'Approved' },
    SUBMITTED: { tone: 'tertiary', label: 'Submitted' },
    UNDER_REVIEW: { tone: 'tertiary', label: 'Review' },
    IN_PROGRESS: { tone: 'primary', label: 'In progress' },
    ASSIGNED: { tone: 'neutral', label: 'Assigned' },
    CREATED: { tone: 'neutral', label: 'Created' },
    REJECTED: { tone: 'error', label: 'Rejected' },
    MISSED: { tone: 'error', label: 'Missed' },
  };
  const m = map[status] || { tone: 'neutral', label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function TaskTypeBadge({ type }) {
  const map = {
    GENERAL: { tone: 'primary', label: 'General' },
    TEAM: { tone: 'secondary', label: 'Team' },
    PRIVATE: { tone: 'tertiary', label: 'Private' },
  };
  const m = map[type] || { tone: 'neutral', label: type };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
