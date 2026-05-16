import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAdminDashboard } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ActivityItem } from '../../components/domain/ActivityItem.jsx';
import { LeaderboardRow } from '../../components/domain/LeaderboardRow.jsx';
import { Loading } from '../../components/ui/Empty.jsx';

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();
  if (isLoading || !data) return <Loading />;

  const { stats, trend, teamCompare, activity, topEmployees } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Mission Control</div>
          <h1 className="mt-1 text-2xl font-bold">Admin overview</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/tasks/new">
            <Button leftIcon={<span className="material-symbols text-base">add</span>}>
              New task
            </Button>
          </Link>
          <Link to="/manager/review">
            <Button variant="ghost">
              {stats.submittedReview} awaiting review
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total tasks" value={stats.totalTasks} icon="task_alt" tone="primary" />
        <StatCard label="Completed" value={stats.completedTasks} icon="check_circle" tone="success" />
        <StatCard label="Late / missed" value={stats.lateTasks} icon="schedule" tone="error" />
        <StatCard label="Active people" value={stats.activeEmployees} icon="group" tone="secondary" />
        <StatCard label="Penalties issued" value={stats.totalPenalties} icon="warning" tone="error" />
        <StatCard label="In review" value={stats.submittedReview} icon="rate_review" tone="tertiary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="label-caps">7-day completion trend</div>
              <div className="text-base font-semibold">Approvals per day</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#adc6ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#adc6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="label" stroke="#c2c6d6" fontSize={12} />
                <YAxis stroke="#c2c6d6" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#171f33',
                    border: '1px solid #ffffff20',
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#adc6ff"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4">
            <div className="label-caps">Top performers</div>
            <div className="text-base font-semibold">Employee leaderboard</div>
          </div>
          <div className="space-y-2">
            {topEmployees.map((u, i) => (
              <LeaderboardRow
                key={u.id}
                rank={i + 1}
                name={u.name}
                avatar={u.avatarUrl}
                subtitle={u.team?.name}
                color={u.team?.color}
                points={u.points}
              />
            ))}
          </div>
          <Link
            to="/admin/leaderboards"
            className="mt-4 flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-primary hover:bg-white/[0.06]"
          >
            Full leaderboard
            <span className="material-symbols text-[14px]">arrow_forward</span>
          </Link>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4">
            <div className="label-caps">Team comparison</div>
            <div className="text-base font-semibold">Completion % by team</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamCompare}>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#c2c6d6" fontSize={12} />
                <YAxis stroke="#c2c6d6" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: '#171f33',
                    border: '1px solid #ffffff20',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
                  {teamCompare.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {teamCompare.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                <span>{t.name}</span>
                <span className="text-on-surface-variant">{t.completion}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-2">
            <div className="label-caps">Recent activity</div>
            <div className="text-base font-semibold">System feed</div>
          </div>
          <div>
            {activity.length === 0 ? (
              <div className="py-6 text-center text-sm text-on-surface-variant">
                No activity yet.
              </div>
            ) : (
              activity.slice(0, 8).map((a) => <ActivityItem key={a.id} item={a} />)
            )}
          </div>
          <Link
            to="/admin/activity"
            className="mt-3 flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-primary hover:bg-white/[0.06]"
          >
            All activity
            <span className="material-symbols text-[14px]">arrow_forward</span>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
