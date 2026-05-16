import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useTeam, useTasks } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LeaderboardRow } from '../../components/domain/LeaderboardRow.jsx';
import { TaskCard } from '../../components/domain/TaskCard.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';

export default function TeamDashboard() {
  const { user } = useAuth();
  const { data: teamData, isLoading: teamLoading } = useTeam(user.teamId);
  const { data: tasksData } = useTasks({ teamId: user.teamId });

  if (teamLoading || !teamData?.team) return <Loading />;
  const team = teamData.team;
  const tasks = tasksData?.tasks || [];

  const totalAssignments = tasks.reduce((s, t) => s + (t.assignments?.length || 0), 0);
  const approved = tasks.reduce(
    (s, t) => s + (t.assignments?.filter((a) => a.status === 'APPROVED').length || 0),
    0,
  );
  const submitted = tasks.reduce(
    (s, t) => s + (t.assignments?.filter((a) => a.status === 'SUBMITTED').length || 0),
    0,
  );
  const completion = totalAssignments ? Math.round((approved / totalAssignments) * 100) : 0;

  const sortedMembers = [...(team.members || [])].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="overflow-hidden p-0">
        <div className="h-1.5 w-full" style={{ background: team.color }} />
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: team.color }}
            >
              Team · {team.code}
            </div>
            <h1 className="mt-1 text-2xl font-bold">{team.name}</h1>
            {team.description && (
              <p className="mt-1 text-sm text-on-surface-variant">{team.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={team.manager?.avatarUrl} name={team.manager?.name} size="sm" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Lead
                </div>
                <div className="text-sm font-medium">{team.manager?.name || 'Unassigned'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Link to="/manager/review">
              <Button variant="ghost">{submitted} pending review</Button>
            </Link>
            <Link to="/admin/tasks/new">
              <Button leftIcon={<span className="material-symbols text-base">add</span>}>
                New task
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={team.members.length} icon="group" tone="primary" />
        <StatCard label="Tasks" value={tasks.length} icon="task_alt" tone="secondary" />
        <StatCard label="Completion" value={`${completion}%`} icon="trending_up" tone="success" />
        <StatCard label="In review" value={submitted} icon="rate_review" tone="tertiary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-caps">Active tasks</div>
            <Link to="/admin/tasks" className="text-xs font-semibold text-primary hover:underline">
              See all →
            </Link>
          </div>
          {tasks.length === 0 ? (
            <Empty icon="task_alt" title="No tasks yet" />
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 6).map((t) => (
                <TaskCard key={t.id} task={t} status={t.status} to={`/tasks/${t.id}`} />
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-3">
            <div className="label-caps">Members</div>
            <div className="text-base font-semibold">Team standings</div>
          </div>
          <div className="space-y-2">
            {sortedMembers.map((m, i) => (
              <LeaderboardRow
                key={m.id}
                rank={i + 1}
                name={m.name}
                avatar={m.avatarUrl}
                subtitle={m.role.replace('_', ' ')}
                color={team.color}
                points={m.points}
                faults={m.faultCount}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
