import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';
import { useSubmitAssignment } from '../../api/hooks.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_MB = 10;

export function SubmitProofModal({ open, onClose, assignment }) {
  const submit = useSubmitAssignment();
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const required = assignment?.task?.proofRequired;

  const onPick = (f) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast.error(`Unsupported file type: ${f.type}`);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large (max ${MAX_MB}MB)`);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async () => {
    if (required && !file) {
      toast.error('Please attach proof');
      return;
    }
    try {
      await submit.mutateAsync({ id: assignment.id, file, note });
      toast.success('Submitted for review');
      onClose?.();
      setFile(null);
      setNote('');
      setPreview(null);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Submit failed');
    }
  };

  if (!assignment) return null;
  const task = assignment.task;

  return (
    <Modal open={open} onClose={onClose} title="Submit task for review" size="lg">
      <div className="space-y-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-on-surface-variant">
            {task.type} task
          </div>
          <div className="mt-1 text-base font-semibold">{task.title}</div>
          {task.description && (
            <div className="mt-1 text-sm text-on-surface-variant">{task.description}</div>
          )}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Proof {required ? '(required)' : '(optional)'}
          </div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPick(e.dataTransfer.files?.[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition hover:border-primary/40 hover:bg-primary/5"
          >
            {preview ? (
              <img src={preview} alt="" className="max-h-48 rounded-md" />
            ) : file ? (
              <div className="flex items-center gap-2">
                <span className="material-symbols text-primary">draft</span>
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-on-surface-variant">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <>
                <span className="material-symbols text-3xl text-primary">cloud_upload</span>
                <div className="text-sm font-medium">Drop file or click to upload</div>
                <div className="text-xs text-on-surface-variant">
                  JPG, PNG, WebP, GIF, PDF · up to {MAX_MB}MB
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ALLOWED.join(',')}
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </div>
        </div>

        <Textarea
          label="Note (optional)"
          placeholder="Add context for the reviewer…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={onSubmit}
            loading={submit.isPending}
            leftIcon={<span className="material-symbols text-base">check</span>}
          >
            Submit for review
          </Button>
        </div>
      </div>
    </Modal>
  );
}
