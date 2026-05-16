import { useAuth } from '../../auth/AuthContext.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { Badge } from '../ui/Badge.jsx';
import { NotificationBell } from '../domain/NotificationBell.jsx';
import { Link } from 'react-router-dom';

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  TEAM_MANAGER: 'Team Manager',
  EMPLOYEE: 'Employee',
};

export function Topbar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-surface/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 md:flex">
          <span className="material-symbols text-on-surface-variant">search</span>
          <span className="text-xs text-on-surface-variant/80">Search tasks, people…</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link
          to="/me/profile"
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 hover:bg-white/[0.08]"
        >
          <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          <div className="hidden flex-col text-left md:flex">
            <span className="text-sm font-semibold leading-tight">{user.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              {ROLE_LABEL[user.role]}
              {user.team ? ` · ${user.team.name}` : ''}
            </span>
          </div>
          {user.warningLevel > 0 && (
            <Badge tone="error">L{user.warningLevel}</Badge>
          )}
        </Link>
      </div>
    </header>
  );
}
