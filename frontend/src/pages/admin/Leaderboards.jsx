import { useState } from 'react';
import {
  useEmployeeLeaderboard,
  useTeamLeaderboard,
  useGlobalLeaderboard,
} from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { LeaderboardRow } from '../../components/domain/LeaderboardRow.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { cn } from '../../lib/cn.js';

const TABS = [
  { v: 'employees', label: 'Employees', icon: 'person' },
  { v: 'teams', label: 'Teams', icon: 'groups' },
  { v: 'global', label: 'Global', icon: 'public' },
];

export default function Leaderboards() {
  const [tab, setTab] = useState('employees');
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Standings</div>
        <h1 className="mt-1 text-2xl font-bold">Leaderboards</h1>
      </div>

      <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={cn(
              'inline-flex items-center gap-2 rounded px-4 py-1.5 text-sm font-medium transition',
              tab === t.v
                ? 'bg-primary/15 text-primary shadow-glow-primary'
                : 'text-on-surface-variant hover:bg-white/5',
            )}
          >
            <span className="material-symbols text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'employees' && <EmployeesTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'global' && <GlobalTab />}
    </div>
  );
}

function EmployeesTab() {
  const { data, isLoading } = useEmployeeLeaderboard({ limit: 50 });
  if (isLoading) return <Loading />;
  const employees = data?.employees || [];
  if (!employees.length) return <Empty icon="leaderboard" title="No standings yet" />;

  const topThree = employees.slice(0, 3);
  const rest = employees.slice(3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const podiumStyles = [
    { h: 'h-32', medal: 'silver', tone: 'text-on-surface' },
    { h: 'h-40', medal: 'gold', tone: 'text-tertiary' },
    { h: 'h-24', medal: 'bronze', tone: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="grid grid-cols-3 items-end gap-4 p-4">
          {podiumOrder.map((u, i) => (
            <div key={u.id} className="flex flex-col items-center text-center">
              <div className="mb-3 flex flex-col items-center">
                <span className={`material-symbols text-3xl ${podiumStyles[i].tone}`}>
                  {i === 1 ? 'workspace_premium' : 'military_tech'}
                </span>
                <div className="mt-2 text-sm font-bold">{u.name}</div>
                <div className="text-xs" style={{ color: u.team?.color }}>
                  {u.team?.name}
                </div>
              </div>
              <div
                className={cn(
                  'flex w-full items-center justify-center rounded-t-lg border border-b-0 border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider',
                  podiumStyles[i].h,
                )}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold tabular-nums text-success">
                    +{u.points}
                  </span>
                  <span className="mt-1 text-[10px] text-on-surface-variant">
                    rank #{u.rank}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <div className="label-caps">Full ranking</div>
          <div className="text-xs text-on-surface-variant">{employees.length} operators</div>
        </div>
        <div className="space-y-2">
          {rest.map((u) => (
            <LeaderboardRow
              key={u.id}
              rank={u.rank}
              name={u.name}
              avatar={u.avatarUrl}
              subtitle={u.team?.name}
              color={u.team?.color}
              points={u.points}
              faults={u.faultCount}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function TeamsTab() {
  const { data, isLoading } = useTeamLeaderboard();
  if (isLoading) return <Loading />;
  const teams = data?.teams || [];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {teams.map((t) => (
        <GlassCard key={t.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold"
                style={{ background: `${t.color}20`, color: t.color }}
              >
                #{t.rank}
              </span>
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: t.color }}
                >
                  {t.code}
                </div>
                <div className="text-base font-bold">{t.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums text-success">+{t.totalPoints}</div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                team total
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Members" value={t.memberCount} />
            <Stat label="Avg pts" value={t.avgPoints} />
            <Stat label="Faults" value={t.totalFaults} tone="text-error" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function GlobalTab() {
  const { data, isLoading } = useGlobalLeaderboard();
  if (isLoading) return <Loading />;
  const users = data?.users || [];
  return (
    <GlassCard>
      <div className="space-y-2">
        {users.map((u) => (
          <LeaderboardRow
            key={u.id}
            rank={u.rank}
            name={u.name}
            avatar={u.avatarUrl}
            subtitle={`${u.role.replace('_', ' ')} · ${u.team?.name || '—'}`}
            color={u.team?.color}
            points={u.points}
            faults={u.faultCount}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] p-2 text-center">
      <div className={cn('text-base font-bold tabular-nums', tone)}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-on-surface-variant">{label}</div>
    </div>
  );
}
