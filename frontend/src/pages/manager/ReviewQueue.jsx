import { useState } from 'react';
import toast from 'react-hot-toast';
import { useReviewQueue, useReviewAssignment } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { TaskTypeBadge } from '../../components/ui/Badge.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { AuthedProof } from '../../components/domain/AuthedProof.jsx';
import { fmtDateTime, fmtDueLabel } from '../../lib/format.js';
import { Link } from 'react-router-dom';

export default function ReviewQueue() {
  const { data, isLoading } = useReviewQueue();
  const review = useReviewAssignment();
  const [reject, setReject] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  if (isLoading) return <Loading />;
  const items = data?.assignments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Manager</div>
          <h1 className="mt-1 text-2xl font-bold">Review queue</h1>
        </div>
        <span className="rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 text-xs font-bold text-tertiary">
          {items.length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <Empty icon="inbox" title="Inbox zero" hint="No submissions awaiting review." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <GlassCard key={a.id}>
              <div className="flex flex-wrap items-start gap-4">
                <Avatar src={a.user?.avatarUrl} name={a.user?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <TaskTypeBadge type={a.task.type} />
                    <span className="text-sm font-medium">{a.user?.name}</span>
                    <span className="text-xs text-on-surface-variant">submitted</span>
                  </div>
                  <Link
                    to={`/tasks/${a.taskId}`}
                    className="block text-base font-semibold hover:text-primary"
                  >
                    {a.task.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-on-surface-variant">
                    <span>Due {fmtDueLabel(a.task.dueAt)}</span>
                    <span>Submitted {fmtDateTime(a.submittedAt)}</span>
                    <span>Reward +{a.task.points} pts</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {a.proofUrl && (
                    <button
                      onClick={() => setPreviewing(a)}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-primary hover:bg-white/[0.08]"
                    >
                      <span className="material-symbols text-[14px]">visibility</span>
                      View proof
                    </button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={async () => {
                        await review.mutateAsync({ id: a.id, decision: 'APPROVED' });
                        toast.success('Approved');
                      }}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setReject(a)}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <RejectModal
        open={!!reject}
        onClose={() => setReject(null)}
        onConfirm={async (note) => {
          await review.mutateAsync({ id: reject.id, decision: 'REJECTED', note });
          toast.success('Rejected — employee notified');
        }}
      />

      <Modal open={!!previewing} onClose={() => setPreviewing(null)} title="Proof preview" size="lg">
        {previewing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">
                {previewing.task.title} — {previewing.user?.name}
              </span>
              {previewing.proofOriginalName && (
                <span className="text-xs text-on-surface-variant/70">
                  {previewing.proofOriginalName}
                </span>
              )}
            </div>
            <AuthedProof
              assignmentId={previewing.id}
              mime={previewing.proofMime}
              originalName={previewing.proofOriginalName}
            />
          </div>
        )}
      </Modal>
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
        placeholder="Tell the employee what to fix…"
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
          Reject submission
        </Button>
      </div>
    </Modal>
  );
}
