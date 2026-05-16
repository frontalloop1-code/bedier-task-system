import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateTask, useTeams, useUsers } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

const dueLocalDefault = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
};

export default function TaskForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useCreateTask();
  const { data: teamsData } = useTeams();
  const { data: usersData } = useUsers();

  const [type, setType] = useState(user.role === 'TEAM_MANAGER' ? 'TEAM' : 'GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(user.role === 'TEAM_MANAGER' ? user.teamId : '');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueAt, setDueAt] = useState(dueLocalDefault());
  const [points, setPoints] = useState(1);
  const [proofRequired, setProofRequired] = useState(true);
  const [priority, setPriority] = useState('Medium');

  const teams = teamsData?.teams || [];
  const users = usersData?.users || [];

  const teamMembers = useMemo(
    () => users.filter((u) => u.teamId === teamId),
    [users, teamId],
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        title,
        description: description || null,
        type,
        teamId: type === 'GENERAL' ? null : teamId,
        dueAt: new Date(dueAt).toISOString(),
        points: Number(points),
        proofRequired,
        assigneeIds:
          type === 'PRIVATE' ? (assigneeId ? [assigneeId] : []) : type === 'TEAM' ? assigneeIds : [],
      };
      await create.mutateAsync(body);
      toast.success('Task created and assigned');
      navigate('/admin/tasks');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Create failed');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="label-caps">Catalog</div>
        <h1 className="mt-1 text-2xl font-bold">Create task</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Define the work, assign the team, and set the reward.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <GlassCard>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                v: 'GENERAL',
                label: 'General',
                icon: 'public',
                active: 'border-primary/50 bg-primary/10 shadow-glow-primary',
                text: 'text-primary',
              },
              {
                v: 'TEAM',
                label: 'Team',
                icon: 'groups',
                active: 'border-secondary/50 bg-secondary/10 shadow-glow-secondary',
                text: 'text-secondary',
              },
              {
                v: 'PRIVATE',
                label: 'Private',
                icon: 'person',
                active: 'border-tertiary/50 bg-tertiary/10 shadow-glow-tertiary',
                text: 'text-tertiary',
              },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                disabled={user.role === 'TEAM_MANAGER' && t.v === 'GENERAL'}
                onClick={() => setType(t.v)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  type === t.v
                    ? t.active
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <span className={`material-symbols text-2xl ${t.text}`}>{t.icon}</span>
                <span className="text-sm font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patch all production servers"
            />
            <Textarea
              label="Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details, links, expected output…"
            />

            {type !== 'GENERAL' && (
              <Select
                label="Team"
                required
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setAssigneeIds([]);
                  setAssigneeId('');
                }}
                disabled={user.role === 'TEAM_MANAGER'}
              >
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            )}

            {type === 'PRIVATE' && (
              <Select
                label="Assigned to"
                required
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Select user…</option>
                {teamMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </Select>
            )}

            {type === 'TEAM' && teamId && (
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Members (optional — leave empty to assign all)
                </div>
                <div className="flex flex-wrap gap-2 rounded-md border border-white/10 bg-surface-container-low p-3">
                  {teamMembers.map((u) => {
                    const checked = assigneeIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                          checked
                            ? 'border-primary/50 bg-primary/15 text-primary'
                            : 'border-white/10 bg-white/[0.02] text-on-surface-variant hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() =>
                            setAssigneeIds((prev) =>
                              prev.includes(u.id)
                                ? prev.filter((x) => x !== u.id)
                                : [...prev, u.id],
                            )
                          }
                        />
                        {u.name}
                      </label>
                    );
                  })}
                  {teamMembers.length === 0 && (
                    <div className="text-xs text-on-surface-variant">No members in team yet.</div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Due date & time"
                type="datetime-local"
                required
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
              <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Reward points"
                type="number"
                min={0}
                max={50}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
              <label className="flex items-end">
                <div className="flex h-10 w-full items-center gap-3 rounded-md border border-white/10 bg-surface-container-low px-3">
                  <input
                    type="checkbox"
                    checked={proofRequired}
                    onChange={(e) => setProofRequired(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">Require proof on completion</span>
                </div>
              </label>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Publish task
          </Button>
        </div>
      </form>
    </div>
  );
}
