import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { BridgeRule } from './ui/Bridge';

function Wordmark({ suffix }) {
  return (
    <div className="leading-none" title="Secure Exchange & Trust Unification Layer">
      <span className="font-semibold text-[0.95rem] tracking-tight text-[var(--ink)]">SETU</span>
      {suffix && (
        <span className="ml-1.5 text-[0.62rem] font-semibold tracking-[0.08em] uppercase text-[var(--ink-faint)]">
          {suffix}
        </span>
      )}
    </div>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`relative px-0.5 py-1.5 text-[0.85rem] transition-colors duration-150 ${
        active ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink-muted)]'
      }`}
      style={{ fontWeight: active ? 600 : 500 }}
    >
      {label}
      {active && <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[var(--teal-700)]" />}
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname]);

  const citizenLinks = [
    { to: '/dashboard', label: 'Overview' },
    { to: '/apply', label: 'New application' },
  ];
  const officerLinks = [
    { to: '/officer', label: 'Overview' },
    { to: '/officer/reviews', label: 'Review queue' },
    { to: '/officer/audit', label: 'Audit trail' },
  ];
  const links = user?.role === 'officer' ? officerLinks : citizenLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      <header className="border-b" style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="h-14 flex items-center justify-between">
            <Link to={user?.role === 'officer' ? '/officer' : '/dashboard'} className="opacity-100 hover:opacity-70 transition-opacity duration-150">
              <Wordmark suffix={user?.role === 'officer' ? 'Operations' : undefined} />
            </Link>
            {user && (
              <nav className="hidden md:flex items-center gap-6">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} label={l.label} active={location.pathname === l.to} />
                ))}
              </nav>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-[0.8rem] font-medium text-[var(--ink)]">{user.name}</div>
                  <div className="text-[0.65rem] text-[var(--ink-faint)] capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[0.8rem] font-medium text-[var(--ink-faint)] hover:text-[var(--danger)] transition-colors duration-150"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div />
            )}
          </div>
          {user && (
            <nav className="flex md:hidden items-center gap-5 pb-3 overflow-x-auto">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} label={l.label} active={location.pathname === l.to} />
              ))}
            </nav>
          )}
        </div>
      </header>
      <main key={location.pathname} className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-8 py-8 md:py-10 page-enter">
        {children}
      </main>
      <footer className="border-t py-5" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <BridgeRule className="mb-3 max-w-xs" />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[0.68rem] text-[var(--ink-faint)]">
              SETU — Secure Exchange &amp; Trust Unification Layer
            </p>
            <p className="text-[0.68rem] text-[var(--ink-faint)]">Prototype environment · Not an official government system</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
