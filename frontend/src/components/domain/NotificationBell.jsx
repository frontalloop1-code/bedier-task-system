import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, useMarkRead, useMarkAllRead } from '../../api/hooks.js';
import { fmtAgo } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const unread = data?.unreadCount || 0;
  const items = data?.items?.slice(0, 8) || [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] focus-ring"
      >
        <span className="material-symbols">notifications</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-on-error shadow-glow-error">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 origin-top-right animate-fade-in glass rounded-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold">Notifications</span>
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-primary hover:underline disabled:opacity-50"
                disabled={!unread}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  You're all caught up.
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 hover:bg-white/[0.03]',
                      !n.isRead && 'bg-primary/[0.04]',
                    )}
                  >
                    <span className="material-symbols mt-0.5 text-primary">
                      {iconFor(n.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && (
                        <div className="truncate text-xs text-on-surface-variant">
                          {n.body}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                          {fmtAgo(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => markRead.mutate(n.id)}
                            className="text-[10px] text-primary hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-white/10 px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-white/5"
            >
              View all
            </Link>
          </div>
        </>
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
