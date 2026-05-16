import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard.jsx';
import { StatusPill, TaskTypeBadge } from '../ui/Badge.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { fmtDueLabel } from '../../lib/format.js';
import { isPast } from 'date-fns';

const ACCENT_BY_TYPE = {
  GENERAL: 'primary',
  TEAM: 'secondary',
  PRIVATE: 'tertiary',
};

export function TaskCard({ task, assignment, to, status, footer }) {
  const accent = ACCENT_BY_TYPE[task?.type];
  const overdue = task?.dueAt && isPast(new Date(task.dueAt));
  const showStatus = status || assignment?.status;

  const card = (
    <GlassCard
      accent={accent}
      className="transition hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <TaskTypeBadge type={task.type} />
            {task.team && (
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  color: task.team.color,
                  borderColor: `${task.team.color}55`,
                  backgroundColor: `${task.team.color}1a`,
                }}
              >
                {task.team.name}
              </span>
            )}
            {showStatus && <StatusPill status={showStatus} />}
            {task.proofRequired && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
                <span className="material-symbols text-[12px]">attach_file</span>
                Proof
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-on-surface">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Reward
          </span>
          <span className="text-lg font-bold tabular-nums text-success">+{task.points}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-error' : 'text-on-surface-variant'}`}>
          <span className="material-symbols text-[14px]">schedule</span>
          {fmtDueLabel(task.dueAt)}
        </div>
        <div className="flex -space-x-2">
          {(task.assignments || []).slice(0, 3).map((a) => (
            <Avatar key={a.id} src={a.user?.avatarUrl} name={a.user?.name} size="xs" />
          ))}
          {(task.assignments?.length || 0) > 3 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-surface-container-high text-[10px] text-on-surface-variant">
              +{task.assignments.length - 3}
            </span>
          )}
        </div>
      </div>
      {footer}
    </GlassCard>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}
