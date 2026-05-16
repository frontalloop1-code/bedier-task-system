import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center text-on-surface-variant">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  return children;
}

export function RoleGate({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (roles && !roles.includes(user.role)) return fallback;
  return children;
}
