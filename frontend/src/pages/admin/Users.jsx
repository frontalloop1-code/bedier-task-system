import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useTeams,
  useIssuePenalty,
} from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';

export default function AdminUsers() {
  const { data, isLoading } = useUsers();
  const { data: teamsData } = useTeams();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const issuePenalty = useIssuePenalty();

  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [penaltyTarget, setPenaltyTarget] = useState(null);

  const users = data?.users || [];
  const teams = teamsData?.teams || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Org</div>
          <h1 className="mt-1 text-2xl font-bold">Users</h1>
        </div>
        <Button
          onClick={() => setOpenNew(true)}
          leftIcon={<span className="material-symbols text-base">person_add</span>}
        >
          Add user
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : users.length === 0 ? (
        <Empty icon="group" title="No users yet" />
      ) : (
        <GlassCard className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Team</th>
                <th className="px-5 py-3 text-right">Points</th>
                <th className="px-5 py-3 text-right">Faults</th>
                <th className="px-5 py-3 text-right">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-on-surface-variant">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === 'SUPER_ADMIN' ? 'tertiary' : u.role === 'TEAM_MANAGER' ? 'secondary' : 'primary'}>
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {u.team ? (
                      <span style={{ color: u.team.color }}>{u.team.name}</span>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums text-success">
                    {u.points}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={u.faultCount > 0 ? 'text-error' : 'text-on-surface-variant'}>
                      {u.faultCount}
                      {u.warningLevel > 0 && ` · L${u.warningLevel}`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="error">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-md p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                        onClick={() => setPenaltyTarget(u)}
                        title="Issue penalty"
                      >
                        <span className="material-symbols text-[18px]">warning</span>
                      </button>
                      <button
                        className="rounded-md p-1.5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                        onClick={() => setEditing(u)}
                        title="Edit"
                      >
                        <span className="material-symbols text-[18px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <UserFormModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        teams={teams}
        title="Add user"
        onSubmit={async (form) => {
          await createUser.mutateAsync(form);
          toast.success('User created');
        }}
      />

      <UserFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        teams={teams}
        initial={editing}
        title="Edit user"
        onSubmit={async (form) => {
          await updateUser.mutateAsync({ id: editing.id, body: form });
          toast.success('User updated');
        }}
      />

      <PenaltyModal
        open={!!penaltyTarget}
        target={penaltyTarget}
        onClose={() => setPenaltyTarget(null)}
        onSubmit={async (body) => {
          await issuePenalty.mutateAsync({ userId: penaltyTarget.id, ...body });
          toast.success('Penalty issued');
        }}
      />
    </div>
  );
}

function UserFormModal({ open, onClose, teams, title, onSubmit, initial }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    teamId: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        email: initial.email,
        password: '',
        role: initial.role,
        teamId: initial.teamId || '',
      });
    } else {
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', teamId: '' });
    }
  }, [initial?.id, open]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const body = { ...form, teamId: form.teamId || null };
            if (initial && !body.password) delete body.password;
            await onSubmit(body);
            onClose();
          } catch (err) {
            toast.error(err?.response?.data?.error || 'Save failed');
          }
        }}
        className="space-y-4"
      >
        <Input
          label="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={initial ? 'New password (leave empty to keep)' : 'Password'}
          type="password"
          required={!initial}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="TEAM_MANAGER">Team Manager</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
          <Select
            label="Team"
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
          >
            <option value="">— None —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function PenaltyModal({ open, target, onClose, onSubmit }) {
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} onClose={onClose} title={`Issue penalty${target ? ` — ${target.name}` : ''}`}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await onSubmit({ type: 'MANUAL', points: Number(points), reason });
            onClose();
            setPoints(1);
            setReason('');
          } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed');
          }
        }}
        className="space-y-4"
      >
        <Input
          label="Points to deduct"
          type="number"
          min={1}
          max={20}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
        <Input
          label="Reason"
          required
          placeholder="What happened?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
