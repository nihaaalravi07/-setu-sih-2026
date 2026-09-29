import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { api } from '../api/client';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageSkeleton from '../components/ui/Skeleton';
import { ConnectedThrough } from '../components/ui/Bridge';

const NEXT_ACTION = {
  awaiting_consent: 'Awaiting your consent before verification can begin.',
  verifying: 'SETU is verifying your details with connected departments.',
  identity_review: 'An officer is confirming one department match. No action needed from you.',
  ready_for_processing: 'Verified and ready for processing.',
  cancelled: 'Cancelled after consent was declined.',
};

const SCHEMES = ['Higher Education Scholarship', 'Healthcare Subsidy Scheme', 'Municipal Housing Assistance'];

function ApplicationRecord({ app }) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)]">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--border)]">
        <div>
          <p className="eyebrow">Application {String(app.id).padStart(4, '0')}</p>
          <h3 className="text-[1.05rem] font-semibold text-[var(--ink)] mt-0.5">{app.scheme_name}</h3>
        </div>
        <Badge status={app.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm">
        <div>
          <dt className="text-xs text-[var(--ink-faint)]">Submitted</dt>
          <dd className="text-[var(--ink)] mt-0.5">
            {new Date(app.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--ink-faint)]">Current status</dt>
          <dd className="text-[var(--ink)] mt-0.5">{NEXT_ACTION[app.status]}</dd>
        </div>
      </dl>
      <div className="px-5 pb-4">
        <Link to={`/application/${app.id}`}>
          <Button size="sm" variant="secondary">View application</Button>
        </Link>
      </div>
    </div>
  );
}

function OtherApplicationRow({ app }) {
  return (
    <Link
      to={`/application/${app.id}`}
      className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-b-0 group"
    >
      <div>
        <p className="text-sm text-[var(--ink)] group-hover:text-[var(--teal-700)] transition-colors duration-150">
          {app.scheme_name}
        </p>
        <p className="text-xs text-[var(--ink-faint)] font-mono-setu mt-0.5">
          {String(app.id).padStart(4, '0')} · {new Date(app.created_at).toLocaleDateString()}
        </p>
      </div>
      <Badge status={app.status} />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.getCitizenApplications(user.id).then((data) => {
      setApps(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    });
  }, [user]);

  if (apps === null) {
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  const active = apps.find((a) => a.status !== 'cancelled' && a.status !== 'ready_for_processing') || apps[0];
  const rest = apps.filter((a) => a.id !== active?.id);

  const connected = ['revenue', 'health', 'municipal'].map((d) => ({
    name: d[0].toUpperCase() + d.slice(1),
    protocol: d === 'revenue' ? 'REST / JSON' : d === 'health' ? 'Legacy XML' : 'CSV',
    connected: apps.some((a) => a.verifications.some((v) => v.department === d)),
  }));

  return (
    <Layout>
      <Section label="Welcome back">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">{user?.name}</h1>
        <p className="text-sm text-[var(--ink-faint)] mt-1">DOB {user?.dob} · Mobile {user?.mobile}</p>
      </Section>

      <Section label="Your applications" action={<Link to="/apply"><Button size="sm" variant="secondary">Start a new application</Button></Link>}>
        {!active && (
          <EmptyState
            title="No applications yet"
            description="Start your first application and SETU will coordinate verification across every connected department."
            action={<Link to="/apply"><Button size="sm">Start an application</Button></Link>}
          />
        )}
        {active && <ApplicationRecord app={active} />}
        {rest.length > 0 && (
          <div className="mt-3">
            {rest.map((a) => (
              <OtherApplicationRow key={a.id} app={a} />
            ))}
          </div>
        )}
      </Section>

      <Section label="Your services">
        <div className="border border-[var(--border)] rounded-[var(--r-md)] divide-y divide-[var(--border)]">
          {SCHEMES.map((s) => (
            <div key={s} className="px-4 py-2.5 text-sm text-[var(--ink)]">
              {s}
            </div>
          ))}
        </div>
      </Section>

      <Section label="Connected through SETU">
        <ConnectedThrough departments={connected} />
      </Section>
    </Layout>
  );
}
