export function Empty({ icon = 'inbox', title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      <span className="material-symbols text-3xl text-on-surface-variant">{icon}</span>
      <div className="text-sm font-medium text-on-surface">{title}</div>
      {hint && <div className="max-w-sm text-xs text-on-surface-variant">{hint}</div>}
      {action}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-on-surface-variant">
      <span className="material-symbols animate-spin">progress_activity</span>
      {label}
    </div>
  );
}
