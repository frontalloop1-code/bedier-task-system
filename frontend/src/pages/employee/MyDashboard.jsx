import { Link } from 'react-router-dom';
import { useMyDashboard } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { TaskCard } from '../../components/domain/TaskCard.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function MyDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useMyDashboard();

  if (isLoading || !data) return <Loading />;

  const { buckets, completionRate, rank, notifications } = data;
  const pts = data.user.points;
  const faults = data.user.faultCount;
  const warning = data.user.warningLevel;

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <GlassCard className="overflow-hidden p-0">
        <div className="relative grid gap-6 p-6 md:grid-cols-4">
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
          </div>
          <div className="md:col-span-2">
            <div className="label-caps">{greeting}</div>
            <h1 className="mt-1 text-2xl font-bold">{user.name}</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {buckets.dueToday.length === 0
                ? 'Nothing due today — keep your streak going.'
                : `${buckets.dueToday.length} task${buckets.dueToday.length === 1 ? '' : 's'} due today.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {warning > 0 && (
                <span className="rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs font-bold text-error">
                  Warning level {warning}
                </span>
              )}
              {user.team && (
                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    color: user.team.color,
                    borderColor: `${user.team.color}55`,
                    backgroundColor: `${user.team.color}1a`,
                  }}
                >
                  {user.team.name} team
                </span>
              )}
            </div>
          </div>

          <Stat label="Total points" value={pts} icon="workspace_premium" tone="text-success" />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Rank" value={rank ? `#${rank}` : '—'} icon="leaderboard" tone="text-primary" />
            <Stat label="Done %" value={`${completionRate}%`} icon="trending_up" tone="text-tertiary" />
            <Stat label="Faults" value={faults} icon="warning" tone="text-error" />
            <Stat label="Today" value={buckets.dueToday.length} icon="today" tone="text-secondary" />
          </div>
        </div>
      </GlassCard>

      {/* Due today */}
      <Section title="Due today" count={buckets.dueToday.length} icon="today">
        {buckets.dueToday.length === 0 ? (
          <Empty icon="check_circle" title="Nothing due today" />
        ) : (
          <Grid>
            {buckets.dueToday.map((a) => (
              <TaskCard key={a.id} task={a.task} status={a.status} to={`/tasks/${a.taskId}`} />
            ))}
          </Grid>
        )}
      </Section>

      {/* Late */}
      {buckets.late.length > 0 && (
        <Section title="Overdue" count={buckets.late.length} icon="schedule" tone="error">
          <Grid>
            {buckets.late.map((a) => (
              <TaskCard key={a.id} task={a.task} status={a.status} to={`/tasks/${a.taskId}`} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Upcoming */}
      <Section title="Upcoming" count={buckets.upcoming.length} icon="event">
        {buckets.upcoming.length === 0 ? (
          <Empty icon="event_available" title="Calendar is clear for the week" />
        ) : (
          <Grid>
            {buckets.upcoming.map((a) => (
              <TaskCard key={a.id} task={a.task} status={a.status} to={`/tasks/${a.taskId}`} />
            ))}
          </Grid>
        )}
      </Section>

      {/* Notifications */}
      {notifications.length > 0 && (
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="label-caps">Latest alerts</div>
            <Link to="/notifications" className="text-xs font-semibold text-primary hover:underline">
              See all →
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3"
              >
                <span className="material-symbols mt-0.5 text-primary">notifications_active</span>
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && (
                    <div className="text-xs text-on-surface-variant">{n.body}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function Stat({ label, value, icon, tone }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span className="material-symbols text-2xl text-on-surface-variant">{icon}</span>
        <div className={`text-xl font-bold tabular-nums ${tone}`}>{value}</div>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
    </div>
  );
}

function Section({ title, count, icon, tone, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className={`material-symbols ${tone === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>
          {icon}
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold tabular-nums text-on-surface-variant">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}
