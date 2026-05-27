import { useAuthedFile } from '../../hooks/useAuthedFile.js';

/**
 * Renders a proof file (image inline, PDF in iframe, other types as download
 * link) fetched with JWT auth. Pass the assignment id; the component hits
 * /api/assignments/:id/proof and handles the blob lifecycle.
 */
export function AuthedProof({ assignmentId, mime, originalName, className }) {
  const { url, loading, error } = useAuthedFile(
    assignmentId ? `/assignments/${assignmentId}/proof` : null,
  );

  if (!assignmentId) return null;

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.02] py-12 text-sm text-on-surface-variant">
          <span className="material-symbols animate-spin">progress_activity</span>
          Loading proof…
        </div>
      </div>
    );
  }

  if (error || !url) {
    const status = error?.response?.status;
    return (
      <div className={className}>
        <div className="flex flex-col items-center gap-2 rounded-md border border-error/30 bg-error/10 py-8 text-sm text-error">
          <span className="material-symbols text-2xl">error</span>
          <div className="font-semibold">
            {status === 403
              ? 'You are not authorized to view this proof.'
              : status === 404
                ? 'Proof file not found.'
                : 'Could not load proof.'}
          </div>
        </div>
      </div>
    );
  }

  const isImage = mime?.startsWith('image/');
  const isPdf = mime === 'application/pdf';

  if (isImage) {
    return (
      <img
        src={url}
        alt={originalName || 'proof'}
        className={className || 'max-h-[60vh] w-full rounded-md object-contain'}
      />
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={url}
        title={originalName || 'proof.pdf'}
        className={className || 'h-[70vh] w-full rounded-md border border-white/10 bg-white'}
      />
    );
  }

  return (
    <a
      href={url}
      download={originalName || 'proof'}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
    >
      <span className="material-symbols text-base">download</span>
      Download {originalName || 'file'}
    </a>
  );
}
