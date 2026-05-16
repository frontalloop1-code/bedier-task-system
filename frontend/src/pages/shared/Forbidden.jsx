import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-md rounded-xl p-8 text-center">
        <span className="material-symbols text-5xl text-error">block</span>
        <h1 className="mt-3 text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          You don't have permission to view this page. If this is unexpected, contact your team
          lead or system administrator.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          <span className="material-symbols text-base">home</span>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
