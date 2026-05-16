import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useTask,
  useStartAssignment,
  useReviewAssignment,
} from '../../api/hooks.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { StatusPill, TaskTypeBadge } from '../../components/ui/Badge.jsx';
import { Loading } from '../../components/ui/Empty.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { SubmitProofModal } from '../../components/domain/SubmitProofModal.jsx';
import { fmtDateTime, fmtDueLabel } from '../../lib/format.js';
import { isPast } from 'date-fns';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useTask(id);
  const start = useStartAssignment();
  const review = useReviewAssignment();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(null);

  if (isLoading || !data) return <Loading />;
  const task = data.task;

  const myAssignment = task.assignments.find((a) => a.userId === user.id);
  const canReview = ['SUPER_ADMIN', 'TEAM_MANAGER'].includes(user.role);
  const overdue = isPast(new Date(task.dueAt));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols text-[18px]">arrow_back</span>
        Back
      </button>

      <GlassCard accent={task.type === 'GENERAL' ? 'primary' : task.type === 'TEAM' ? 'secondary' : 'tertiary'}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <TaskTypeBadge type={task.type} />
              {task.team && (
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: task.team.color,
                    borderColor: `${task.team.color}55`,
                    backgroundColor: `${task.team.color}1a`,
                  }}
                >
                  {task.team.name}
                </span>
              )}
              <StatusPill status={task.status} />
              {task.proofRequired && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
                  <span className="material-symbols text-[12px]">attach_file</span>
                  Proof required
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            {task.description && (
              <p className="mt-2 text-sm text-on-surface-variant">{task.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Info label="Due" value={fmtDueLabel(task.dueAt)} tone={overdue ? 'text-error' : ''} />
              <Info label="Reward" value={`+${task.points} pts`} tone="text-success" />
              <Info label="Created by" value={task.createdBy?.name} />
              <Info label="Created" value={fmtDateTime(task.createdAt)} />
            </div>
          </div>
          {myAssignment && (
            <div className="flex flex-col gap-2">
              {['ASSIGNED'].includes(myAssignment.status) && (
                <Button
                  onClick={async () => {
                    await start.mutateAsync(myAssignment.id);
                    toast.success('Started');
                  }}
                  leftIcon={<span className="material-symbols text-base">play_arrow</span>}
                >
                  Start task
                </Button>
              )}
              {['ASSIGNED', 'IN_PROGRESS', 'REJECTED'].includes(myAssignment.status) && (
                <Button
                  variant="success"
                  onClick={() => setSubmitOpen(true)}
                  leftIcon={<span className="material-symbols text-base">upload</span>}
                >
                  Submit for review
                </Button>
              )}
              {myAssignment.status === 'SUBMITTED' && (
                <span className="rounded-md border border-tertiary/30 bg-tertiary/10 px-3 py-2 text-center text-xs font-semibold text-tertiary">
                  Awaiting review
                </span>
              )}
              {myAssignment.status === 'APPROVED' && (
                <span className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
                  +{myAssignment.awardedPoints || task.points} awarded
                </span>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <div className="label-caps">Assignments ({task.assignments.length})</div>
        </div>
        <div className="divide-y divide-white/5">
          {task.assignments.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              <Avatar src={a.user?.avatarUrl} name={a.user?.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{a.user?.name}</div>
                {a.submittedAt && (
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Submitted {fmtDateTime(a.submittedAt)}
                  </div>
                )}
              </div>
              <StatusPill status={a.status} />
              {a.proofUrl && (
                <a
                  href={`/api/assignments/${a.id}/proof`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-primary hover:bg-white/[0.08]"
                >
                  <span className="material-symbols text-[14px]">visibility</span>
                  View proof
                </a>
              )}
              {canReview && a.status === 'SUBMITTED' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={async () => {
                      await review.mutateAsync({ id: a.id, decision: 'APPROVED' });
                      toast.success('Approved · points awarded');
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setRejectOpen(a)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <SubmitProofModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        assignment={myAssignment ? { ...myAssignment, task } : null}
      />

      <RejectModal
        open={!!rejectOpen}
        onClose={() => setRejectOpen(null)}
        onConfirm={async (note) => {
          await review.mutateAsync({ id: rejectOpen.id, decision: 'REJECTED', note });
          toast.success('Rejected · employee notified');
        }}
      />
    </div>
  );
}

function Info({ label, value, tone }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={`text-sm font-medium ${tone || ''}`}>{value || '—'}</div>
    </div>
  );
}

function RejectModal({ open, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Reject submission" size="md">
      <Textarea
        label="Reason for rejection"
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Explain what needs to change…"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            await onConfirm(note);
            onClose();
            setNote('');
          }}
        >
          Reject
        </Button>
      </div>
    </Modal>
  );
}
