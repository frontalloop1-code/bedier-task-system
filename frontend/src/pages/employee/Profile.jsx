import { useAuth } from '../../auth/AuthContext.jsx';
import { usePointsHistory, useMyDashboard } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { FaultPointsCard } from '../../components/domain/FaultPointsCard.jsx';
import { fmtAgo } from '../../lib/format.js';

export default function Profile() {
  const { user } = useAuth();
  const { data, isLoading } = usePointsHistory(user?.id);
  const { data: dash } = useMyDashboard();

  const maxFaults = dash?.user?.maxFaults ?? 4;
  const stats = dash?.stats || { completed: 0, pending: 0, missed: 0, total: 0 };
  const completionRate = dash?.completionRate ?? 0;

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-wrap items-center gap-5">
          <Avatar src={user.avatarUrl} name={user.name} size="xl" />
          <div className="flex-1">
            <div className="label-caps">Profile</div>
            <h1 className="mt-1 text-2xl font-bold">{user.name}</h1>
            <div className="mt-1 text-sm text-on-surface-variant">{user.email}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="primary">{user.role.replace('_', ' ')}</Badge>
              {user.team && (
                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    color: user.team.color,
                    borderColor: `${user.team.color}55`,
                    backgroundColor: `${user.team.color}1a`,
                  }}
                >
                  {user.team.name}
                </span>
              )}
              {user.warningLevel > 0 && (
                <Badge tone="error">Warning L{user.warningLevel}</Badge>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Personal statistics — completed, pending, points, completion rate */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Total points" value={user.points} tone="text-success" icon="workspace_premium" />
        <KPI label="Completed" value={stats.completed} tone="text-primary" icon="check_circle" />
        <KPI label="Pending" value={stats.pending} tone="text-tertiary" icon="pending" />
        <KPI label="Performance" value={`${completionRate}%`} tone="text-secondary" icon="trending_up" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FaultPointsCard
          used={user.faultCount}
          max={maxFaults}
          warningLevel={user.warningLevel}
          className="lg:col-span-1"
        />
        <GlassCard className="lg:col-span-2">
          <div className="mb-3">
            <div className="label-caps">Performance</div>
            <div className="text-base font-semibold">Task breakdown</div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Total assigned" value={stats.total} />
            <Mini label="Completed" value={stats.completed} tone="text-success" />
            <Mini label="Pending" value={stats.pending} tone="text-tertiary" />
            <Mini label="Missed" value={stats.missed} tone="text-error" />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Completion rate</span>
              <span className="font-bold tabular-nums text-on-surface">{completionRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-success transition-all shadow-glow-success"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-3">
          <div className="label-caps">History</div>
          <div className="text-base font-semibold">Points & penalties</div>
        </div>
        {isLoading ? (
          <Loading />
        ) : !data?.events?.length ? (
          <Empty icon="history" title="No activity yet" />
        ) : (
          <div className="space-y-2">
            {data.events.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols ${e.kind === 'AWARD' ? 'text-success' : 'text-error'}`}
                  >
                    {e.kind === 'AWARD' ? 'workspace_premium' : 'warning'}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {e.meta} · {fmtAgo(e.at)}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-base font-bold tabular-nums ${
                    e.points > 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {e.points > 0 ? '+' : ''}
                  {e.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function KPI({ label, value, tone, icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        {icon && (
          <span className="material-symbols text-on-surface-variant">{icon}</span>
        )}
        <div className={`text-2xl font-bold tabular-nums ${tone || 'text-on-surface'}`}>
          {value}
        </div>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
    </div>
  );
}

function Mini({ label, value, tone }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-center">
      <div className={`text-xl font-bold tabular-nums ${tone || 'text-on-surface'}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
    </div>
  );
}
