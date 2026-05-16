import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-md rounded-xl p-8 text-center">
        <span className="material-symbols text-5xl text-tertiary">explore</span>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          The screen you're looking for doesn't exist on this workspace.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          <span className="material-symbols text-base">home</span>
          Home
        </Link>
      </div>
    </div>
  );
}
