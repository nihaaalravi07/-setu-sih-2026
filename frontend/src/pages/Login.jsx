import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../api/AuthContext';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Banner from '../components/ui/Banner';
import { BridgeRule } from '../components/ui/Bridge';

const DEMO_ACCOUNTS = [
  { username: 'rahul', password: 'demo123', label: 'Rahul Kumar', desc: 'Citizen · Application 0001, ready for processing' },
  { username: 'priya', password: 'demo123', label: 'Priya Sharma', desc: 'Citizen · Application 0002, identity review pending' },
  { username: 'officer', password: 'demo123', label: 'Officer Anita Singh', desc: 'Department officer' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (u, p) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login(u, p);
      setUser(res.user);
      navigate(res.user.role === 'officer' ? '/officer' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-[860px] grid md:grid-cols-2 border border-[var(--border)] rounded-[var(--r-lg)] overflow-hidden bg-[var(--surface)]">
        <div className="p-9 border-b md:border-b-0 md:border-r border-[var(--border)] flex flex-col justify-between" style={{ background: 'var(--surface-sunken)' }}>
          <div>
            <p className="font-semibold text-[var(--ink)] tracking-tight mb-1">SETU</p>
            <p className="text-xs text-[var(--ink-faint)] mb-8">Secure Exchange &amp; Trust Unification Layer</p>

            <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-[300px]">
              Connecting systems. Simplifying services.
            </p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-[300px] mt-3">
              Revenue, Health and Municipal departments keep their own records and
              formats. SETU verifies eligibility once, across all three.
            </p>
          </div>

          <div className="mt-10">
            <BridgeRule className="mb-4" />
            <p className="text-xs text-[var(--ink-faint)] leading-relaxed">
              <b className="text-[var(--ink-muted)]">Setu</b> means bridge. The name reflects the
              platform's role: connecting systems that were built separately, without
              replacing them.
            </p>
          </div>
        </div>

        <div className="p-9">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--ink)]">Sign in</h1>
            <span className="tag bg-[var(--saffron-tint)] text-[var(--saffron-600)] border-l-2" style={{ borderLeftColor: 'var(--saffron-600)' }}>
              Prototype environment
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              doLogin(username, password);
            }}
            className="space-y-4"
          >
            <Field
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rahul"
              autoComplete="username"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123"
              autoComplete="current-password"
            />
            {error && <Banner tone="danger">{error}</Banner>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="eyebrow mb-2.5">Demo accounts</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => doLogin(acc.username, acc.password)}
                  className="w-full text-left px-3 py-2 rounded-[var(--r-sm)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors duration-150"
                >
                  <div className="text-[0.83rem] font-medium text-[var(--ink)]">{acc.label}</div>
                  <div className="text-[0.7rem] text-[var(--ink-faint)]">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
