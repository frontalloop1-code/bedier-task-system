import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      const dest =
        u.role === 'SUPER_ADMIN' ? '/admin' : u.role === 'TEAM_MANAGER' ? '/team' : '/me';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-surface-container-low p-10 lg:flex">
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 shadow-glow-primary">
            <span className="material-symbols text-primary">hub</span>
          </div>
          <div>
            <div className="text-base font-bold">Bedier</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              Task Command
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Mission Control
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-on-surface">
            Run every team.
            <br />
            See every task.
            <br />
            Reward every win.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-on-surface-variant">
            Centralized task tracking, performance scoring, and proof-backed reviews for IT,
            Creative, Operations, Tech, and Admin teams.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { v: '3', l: 'Teams' },
              { v: '5', l: 'Admins' },
              { v: '∞', l: 'Possibilities' },
            ].map((s) => (
              <div
                key={s.l}
                className="glass rounded-lg p-3 text-center"
              >
                <div className="text-xl font-bold text-primary">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-on-surface-variant">
          © Bedier Group · Internal
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Sign in to your Bedier Group workspace.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              leftIcon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@bedier.local"
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              leftIcon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              rightIcon={<span className="material-symbols text-base">arrow_forward</span>}
            >
              Sign in
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
