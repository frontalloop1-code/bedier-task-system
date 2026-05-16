import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTeams, useUsers, useAssignTeamManager } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';

export default function AdminTeams() {
  const { data, isLoading } = useTeams();
  const [assigning, setAssigning] = useState(null);

  if (isLoading) return <Loading />;
  const teams = data?.teams || [];
  if (!teams.length) return <Empty icon="groups" title="No teams configured" />;

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Org</div>
        <h1 className="mt-1 text-2xl font-bold">Teams</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Each team has exactly one Team Leader, selected manually by an admin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => (
          <GlassCard key={t.id} className="overflow-hidden p-0">
            <div className="h-2 w-full" style={{ background: t.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: t.color }}
                  >
                    {t.code}
                  </div>
                  <div className="mt-1 text-xl font-bold">{t.name}</div>
                </div>
                <span
                  className="material-symbols flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: `${t.color}20`, color: t.color }}
                >
                  groups
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={t.manager?.avatarUrl} name={t.manager?.name} size="sm" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Team Leader
                    </div>
                    <div className="text-sm font-medium">
                      {t.manager?.name || (
                        <span className="text-error">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setAssigning(t)}>
                  {t.manager ? 'Reassign' : 'Assign'}
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-2xl font-bold tabular-nums">{t._count.members}</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Members
                  </div>
                </div>
                <div className="rounded-md border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-2xl font-bold tabular-nums">{t._count.tasks}</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Tasks
                  </div>
                </div>
              </div>

              <Link
                to="/admin/users"
                className="mt-4 flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-primary hover:bg-white/[0.06]"
              >
                Manage members
                <span className="material-symbols text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      <AssignManagerModal
        team={assigning}
        onClose={() => setAssigning(null)}
      />
    </div>
  );
}

function AssignManagerModal({ team, onClose }) {
  const open = !!team;
  const { data } = useUsers();
  const assign = useAssignTeamManager();
  const [selected, setSelected] = useState('');

  const candidates = (data?.users || []).filter(
    (u) => u.isActive && u.role !== 'SUPER_ADMIN',
  );

  const onSave = async () => {
    if (!selected) {
      toast.error('Pick a user first');
      return;
    }
    try {
      await assign.mutateAsync({ teamId: team.id, userId: selected });
      toast.success('Team leader assigned');
      onClose();
      setSelected('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed');
    }
  };

  const onClear = async () => {
    try {
      await assign.mutateAsync({ teamId: team.id, userId: null });
      toast.success('Team leader cleared');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed');
    }
  };

  if (!team) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Team Leader — ${team.name}`}
      size="md"
    >
      <p className="mb-3 text-sm text-on-surface-variant">
        The chosen user will be promoted to <strong>Team Manager</strong> and moved to
        this team. Each team can have only one leader.
      </p>

      <div className="max-h-80 space-y-1.5 overflow-y-auto rounded-md border border-white/10 bg-surface-container-low p-2 scrollbar-thin">
        {candidates.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-on-surface-variant">
            No eligible users. Add an employee or manager first.
          </div>
        ) : (
          candidates.map((u) => (
            <label
              key={u.id}
              className={`flex cursor-pointer items-center gap-3 rounded-md border p-2 transition ${
                selected === u.id
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <input
                type="radio"
                name="manager"
                checked={selected === u.id}
                onChange={() => setSelected(u.id)}
                className="hidden"
              />
              <Avatar src={u.avatarUrl} name={u.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.name}</div>
                <div className="truncate text-xs text-on-surface-variant">
                  {u.email} · {u.role.replace('_', ' ')}
                  {u.team ? ` · ${u.team.name}` : ''}
                </div>
              </div>
              {team.manager?.id === u.id && (
                <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Current
                </span>
              )}
            </label>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {team.manager && (
          <Button variant="ghost" onClick={onClear} loading={assign.isPending}>
            Clear current leader
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={assign.isPending} disabled={!selected}>
            Assign as leader
          </Button>
        </div>
      </div>
    </Modal>
  );
}
