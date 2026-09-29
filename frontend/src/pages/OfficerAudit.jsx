import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Table from '../components/ui/Table';
import EmptyState from '../components/ui/EmptyState';
import PageSkeleton from '../components/ui/Skeleton';

const ACTION_LABEL = {
  login: 'Login',
  application_created: 'Application Created',
  consent_submitted: 'Consent Submitted',
  department_verification: 'Department Verification',
  verification_run: 'Verification Run',
  identity_match_approved: 'Identity Match Approved',
  identity_match_rejected: 'Identity Match Rejected',
  seed: 'System Seed',
};

const COLUMNS = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    render: (r) => (
      <span className="font-mono-setu text-xs text-[var(--ink-faint)] whitespace-nowrap">
        {new Date(r.timestamp).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    ),
  },
  {
    key: 'actor',
    header: 'Actor',
    render: (r) => <span className="font-medium">{r.actor}</span>,
  },
  {
    key: 'action',
    header: 'Action',
    render: (r) => ACTION_LABEL[r.action] || r.action,
  },
  {
    key: 'details',
    header: 'Result',
    render: (r) => <span className="text-[var(--ink-muted)]">{r.details || '—'}</span>,
  },
];

export default function OfficerAudit() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    api.audit().then(setLogs);
  }, []);

  if (!logs) {
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Accountability"
        title="Audit trail"
        subtitle="Every consent, verification and identity decision made through SETU, in order."
      />

      {logs.length === 0 ? (
        <EmptyState title="No audit records yet" description="Actions taken across the platform will be recorded here." />
      ) : (
        <Table columns={COLUMNS} rows={logs} />
      )}
    </Layout>
  );
}
