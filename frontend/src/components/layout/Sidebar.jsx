import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { cn } from '../../lib/cn.js';

const NAV = {
  SUPER_ADMIN: [
    { section: 'Command' },
    { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/tasks', icon: 'task_alt', label: 'Tasks' },
    { to: '/admin/leaderboards', icon: 'leaderboard', label: 'Leaderboards' },
    { section: 'Org' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/admin/teams', icon: 'groups', label: 'Teams' },
    { section: 'System' },
    { to: '/admin/activity', icon: 'history', label: 'Activity log' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
    { to: '/manager/review', icon: 'rate_review', label: 'Review queue' },
  ],
  TEAM_MANAGER: [
    { section: 'Team' },
    { to: '/team', icon: 'space_dashboard', label: 'Team dashboard' },
    { to: '/manager/review', icon: 'rate_review', label: 'Review queue' },
    { to: '/admin/tasks', icon: 'task_alt', label: 'Tasks' },
    { to: '/admin/leaderboards', icon: 'leaderboard', label: 'Leaderboards' },
    { section: 'Personal' },
    { to: '/me', icon: 'person', label: 'My dashboard' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  ],
  EMPLOYEE: [
    { section: 'You' },
    { to: '/me', icon: 'space_dashboard', label: 'My dashboard' },
    { to: '/me/profile', icon: 'person', label: 'Profile' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications' },
    { section: 'Standings' },
    { to: '/admin/leaderboards', icon: 'leaderboard', label: 'Leaderboards' },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = NAV[user.role] || [];

  return (
    <aside className="hidden w-sidebar-width shrink-0 flex-col border-r border-white/5 bg-surface-container-low/60 backdrop-blur md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 shadow-glow-primary">
          <span className="material-symbols text-primary">hub</span>
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">Bedier</div>
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            Task Command
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {items.map((item, i) =>
          item.section ? (
            <div
              key={`s-${i}`}
              className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/80"
            >
              {item.section}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/team' || item.to === '/me'}
              className={({ isActive }) =>
                cn(
                  'group relative mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-primary/10 text-on-surface before:absolute before:left-0 before:top-1.5 before:h-[calc(100%-12px)] before:w-[2px] before:rounded-full before:bg-primary'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
                )
              }
            >
              <span className="material-symbols text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-on-surface-variant hover:bg-white/5 hover:text-error"
        >
          <span className="material-symbols">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
