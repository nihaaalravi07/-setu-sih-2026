import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Table from '../components/ui/Table';
import Timeline from '../components/ui/Timeline';
import ConfidenceMeter from '../components/ui/ConfidenceMeter';
import ProgressSteps, { stepIndexForStatus } from '../components/ui/ProgressSteps';
import PageSkeleton from '../components/ui/Skeleton';

const CONSENT_ITEMS = [
  { dept: 'Revenue Department', purpose: 'Income verification' },
  { dept: 'Health Department', purpose: 'Eligibility verification' },
  { dept: 'Municipal Department', purpose: 'Address verification' },
];

const DEPT_META = {
  revenue: { label: 'Revenue', format: 'REST / JSON' },
  health: { label: 'Health', format: 'Legacy XML' },
  municipal: { label: 'Municipal', format: 'CSV' },
};

function ConsentScreen({ app, onDecision, busy }) {
  return (
    <div className="max-w-lg">
      <p className="eyebrow mb-2">Purpose-bound consent</p>
      <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-5">
        SETU requests permission to verify application{' '}
        <span className="font-mono-setu text-[var(--ink)]">{String(app.id).padStart(4, '0')}</span> (
        <b className="text-[var(--ink)]">{app.scheme_name}</b>) with the departments below. Data is used only for this
        stated purpose and is not stored beyond verification.
      </p>

      <div className="border border-[var(--border)] rounded-[var(--r-md)] mb-6">
        {CONSENT_ITEMS.map((c) => (
          <div key={c.dept} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-b-0">
            <span className="text-sm text-[var(--ink)]">{c.dept}</span>
            <span className="text-xs text-[var(--ink-faint)]">{c.purpose}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onDecision(true)} loading={busy} variant="teal">
          Grant consent
        </Button>
        <Button onClick={() => onDecision(false)} disabled={busy} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}

const CONNECT_STAGES = ['Revenue', 'Health', 'Municipal'];

function VerifyingState() {
  return (
    <div className="max-w-md py-4">
      <p className="eyebrow mb-4">Connecting to departments</p>
      <div className="space-y-3">
        {CONNECT_STAGES.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-2.5 opacity-0"
            style={{ animation: `fade-in 200ms var(--ease-out) ${i * 350 + 100}ms forwards` }}
          >
            <span className="w-3 h-3 rounded-full border-2 border-[var(--teal-700)] border-t-transparent animate-spin shrink-0" />
            <span className="text-sm text-[var(--ink-muted)]">Verifying with {s}…</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CANONICAL_LABEL = { revenue: 'Revenue', health: 'Health', municipal: 'Municipal' };

function IdentityResolution({ app }) {
  if (app.identity_matches.length === 0) return null;
  const needsReview = app.identity_matches.some((m) => m.status === 'pending_review');
  const anyRejected = app.identity_matches.some((m) => m.status === 'rejected');
  const anyOfficerConfirmed = app.identity_matches.some((m) => m.status === 'confirmed');
  const resolved = needsReview ? undefined : anyRejected ? 'rejected' : anyOfficerConfirmed ? 'confirmed' : undefined;
  const avg =
    Math.round((app.identity_matches.reduce((s, m) => s + m.confidence_score, 0) / app.identity_matches.length) * 10) / 10;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="eyebrow mb-1">Canonical citizen record</p>
          <p className="text-lg font-semibold text-[var(--ink)]">{app.citizen_name}</p>
        </div>
        <ConfidenceMeter score={avg} label="Overall confidence" resolved={resolved} />
      </div>

      <div className="border border-[var(--border)] rounded-[var(--r-md)] overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse min-w-[420px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
              <th className="text-left font-semibold text-[0.68rem] uppercase tracking-wide text-[var(--ink-faint)] px-4 py-2">Department</th>
              <th className="text-left font-semibold text-[0.68rem] uppercase tracking-wide text-[var(--ink-faint)] px-4 py-2">Recorded name</th>
              <th className="text-left font-semibold text-[0.68rem] uppercase tracking-wide text-[var(--ink-faint)] px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {app.identity_matches.map((m) => {
              const verification = app.verifications.find((v) => v.department === m.department);
              return (
                <tr key={m.id} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="px-4 py-2.5 text-[var(--ink)]">{CANONICAL_LABEL[m.department]}</td>
                  <td className="px-4 py-2.5 text-[var(--ink)]">{verification?.canonical_data?.name}</td>
                  <td className="px-4 py-2.5">
                    <Badge status={m.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--ink-muted)] max-w-xl">
        {needsReview
          ? 'One department record did not match automatically on all identity attributes. An officer will confirm this identity before the application proceeds.'
          : 'Identity resolved across all departmental records.'}
      </p>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const load = useCallback(async () => {
    const [a, t] = await Promise.all([api.getApplication(id), api.getTimeline(id)]);
    setApp(a);
    setTimeline(t);
    return a;
  }, [id]);

  useEffect(() => {
    setApp(null);
    load();
  }, [load]);

  useEffect(() => {
    if (app?.status === 'verifying' && app.verifications.length === 0 && !verifying) {
      setVerifying(true);
      const minWait = new Promise((r) => setTimeout(r, 1100));
      Promise.all([api.runVerification(id), minWait]).then(async () => {
        await load();
        setVerifying(false);
      });
    }
  }, [app, id, load, verifying]);

  const handleConsent = async (granted) => {
    setBusy(true);
    try {
      await api.submitConsent(id, granted, ['income_verification', 'eligibility_verification', 'address_verification']);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!app) {
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  const needsReview = app.identity_matches.some((m) => m.status === 'pending_review');
  const stepIndex = stepIndexForStatus(app.status);
  const showVerifying = verifying || (app.status === 'verifying' && app.verifications.length === 0);

  return (
    <Layout>
      <Link to="/dashboard" className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors duration-150 mb-5 inline-block">
        ← Overview
      </Link>

      <PageHeader
        eyebrow={`Application ${String(app.id).padStart(4, '0')}`}
        title={app.scheme_name}
        subtitle={app.citizen_name}
        meta={<Badge status={app.status} />}
      />

      <Section label="Application journey">
        <div className="max-w-xl">
          <ProgressSteps currentIndex={stepIndex} />
        </div>
      </Section>

      {app.status === 'awaiting_consent' && <ConsentScreen app={app} onDecision={handleConsent} busy={busy} />}

      {app.status === 'cancelled' && (
        <Banner tone="danger" className="max-w-md">
          Consent was declined. This application has been cancelled.
        </Banner>
      )}

      {showVerifying && <VerifyingState />}

      {!showVerifying && app.verifications.length > 0 && (
        <div>
          {needsReview && (
            <Banner tone="warning" className="mb-8 max-w-2xl">
              One department match requires officer review before this application can proceed.
            </Banner>
          )}
          {app.status === 'ready_for_processing' && (
            <Banner tone="success" className="mb-8 max-w-2xl">
              Identity resolved and all departments verified. Ready for processing.
            </Banner>
          )}

          <Section label="Verification">
            <Table
              columns={[
                { key: 'department', header: 'Department', render: (v) => DEPT_META[v.department]?.label },
                { key: 'source_format', header: 'Source', render: (v) => <span className="font-mono-setu text-xs">{DEPT_META[v.department]?.format}</span> },
                { key: 'source_record_id', header: 'Record', render: (v) => <span className="font-mono-setu text-xs text-[var(--ink-faint)]">{v.source_record_id}</span> },
                { key: 'confidence_score', header: 'Confidence', render: (v) => <span className="font-mono-setu text-xs">{v.confidence_score}%</span> },
                { key: 'verification_status', header: 'Result', render: (v) => <Badge status={v.verification_status} /> },
              ]}
              rows={app.verifications}
            />
          </Section>

          <Section label="Identity resolution">
            <IdentityResolution app={app} />
          </Section>

          <Section label="Timeline">
            <Timeline events={timeline} />
          </Section>
        </div>
      )}
    </Layout>
  );
}
