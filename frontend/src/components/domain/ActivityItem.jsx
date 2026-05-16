import { Avatar } from '../ui/Avatar.jsx';
import { fmtAgo } from '../../lib/format.js';

const META = {
  TASK_CREATED: { icon: 'add_task', tone: 'text-primary' },
  TASK_ASSIGNED: { icon: 'assignment_ind', tone: 'text-primary' },
  TASK_STARTED: { icon: 'play_arrow', tone: 'text-tertiary' },
  TASK_SUBMITTED: { icon: 'upload_file', tone: 'text-tertiary' },
  TASK_REVIEWED: { icon: 'rate_review', tone: 'text-primary' },
  POINTS_AWARDED: { icon: 'workspace_premium', tone: 'text-success' },
  PENALTY_ISSUED: { icon: 'warning', tone: 'text-error' },
  USER_LOGIN: { icon: 'login', tone: 'text-on-surface-variant' },
  USER_CREATED: { icon: 'person_add', tone: 'text-primary' },
};

export function ActivityItem({ item }) {
  const m = META[item.type] || { icon: 'circle', tone: 'text-on-surface-variant' };
  return (
    <div className="flex items-start gap-3 border-b border-white/5 px-1 py-3 last:border-b-0">
      <span className={`material-symbols mt-0.5 text-[20px] ${m.tone}`}>{m.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.actor && (
            <>
              <Avatar src={item.actor.avatarUrl} name={item.actor.name} size="xs" />
              <span className="text-sm font-medium">{item.actor.name}</span>
            </>
          )}
          <span className="text-sm text-on-surface-variant">{describe(item)}</span>
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
          {fmtAgo(item.createdAt)}
        </div>
      </div>
    </div>
  );
}

function describe(item) {
  const m = item.metadata || {};
  switch (item.type) {
    case 'TASK_CREATED':
      return `created task "${m.title || ''}"`;
    case 'TASK_ASSIGNED':
      return `assigned task to ${m.assignees || 'user'}`;
    case 'TASK_STARTED':
      return 'started a task';
    case 'TASK_SUBMITTED':
      return `submitted "${m.taskTitle || 'task'}"${m.late ? ' (late)' : ''}`;
    case 'TASK_REVIEWED':
      return `reviewed submission · ${m.decision?.toLowerCase() || 'reviewed'}`;
    case 'POINTS_AWARDED':
      return `awarded ${m.points || ''} points${m.reason ? ` (${m.reason})` : ''}`;
    case 'PENALTY_ISSUED':
      return `issued penalty: ${m.reason || ''}`;
    case 'USER_LOGIN':
      return 'signed in';
    case 'USER_CREATED':
      return `created user ${m.name || ''}`;
    default:
      return item.type.replaceAll('_', ' ').toLowerCase();
  }
}
