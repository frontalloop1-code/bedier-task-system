import { useNotifications, useMarkRead, useMarkAllRead } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { fmtAgo } from '../../lib/format.js';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

export default function Notifications() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = data?.items || [];
  const unread = data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Inbox</div>
          <h1 className="mt-1 text-2xl font-bold">
            Notifications
            {unread > 0 && (
              <span className="ml-2 rounded-full border border-error/30 bg-error/10 px-2 py-0.5 text-xs font-bold text-error">
                {unread} unread
              </span>
            )}
          </h1>
        </div>
        <Button variant="ghost" disabled={!unread} onClick={() => markAll.mutate()}>
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="notifications_off" title="No notifications yet" />
      ) : (
        <GlassCard className="p-0">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 border-b border-white/5 p-4 last:border-b-0',
                !n.isRead && 'bg-primary/[0.04]',
              )}
            >
              <span className={`material-symbols mt-0.5 ${iconTone(n.type)}`}>
                {iconFor(n.type)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{n.title}</span>
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                {n.body && (
                  <div className="text-sm text-on-surface-variant">{n.body}</div>
                )}
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    {fmtAgo(n.createdAt)}
                  </span>
                  {n.link && (
                    <Link to={n.link} className="text-xs font-semibold text-primary hover:underline">
                      View →
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="text-xs text-on-surface-variant hover:text-on-surface hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

function iconFor(type) {
  return (
    {
      TASK_ASSIGNED: 'assignment',
      TASK_DUE_SOON: 'schedule',
      TASK_APPROVED: 'check_circle',
      TASK_REJECTED: 'cancel',
      FAULT_ISSUED: 'warning',
      RANK_CHANGED: 'leaderboard',
    }[type] || 'notifications'
  );
}
function iconTone(type) {
  if (['TASK_APPROVED'].includes(type)) return 'text-success';
  if (['TASK_REJECTED', 'FAULT_ISSUED'].includes(type)) return 'text-error';
  if (['TASK_DUE_SOON'].includes(type)) return 'text-tertiary';
  return 'text-primary';
}
