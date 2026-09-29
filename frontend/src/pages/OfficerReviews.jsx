import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Banner from '../components/ui/Banner';
import ConfidenceMeter from '../components/ui/ConfidenceMeter';
import EmptyState from '../components/ui/EmptyState';
import PageSkeleton from '../components/ui/Skeleton';

const DEPT_ORDER = ['revenue', 'health', 'municipal'];
const DEPT_LABEL = { revenue: 'Revenue', health: 'Health', municipal: 'Municipal' };

function SourceRecordsTable({ verifications, mismatchDept }) {
  const byDept = Object.fromEntries(verifications.map((v) => [v.department, v.canonical_data]));
  const rows = [
    { key: 'name', label: 'Name' },
    { key: 'dob', label: 'Date of birth' },
    { key: 'mobile', label: 'Mobile' },
  ];
  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)] overflow-x-auto mb-5">
      <table className="w-full text-sm border-collapse min-w-[420px]">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
            <th className="text-left font-semibold text-[0.68rem] uppercase tracking-wide text-[var(--ink-faint)] px-4 py-2 w-32">Field</th>
            {DEPT_ORDER.map((d) => (
              <th
                key={d}
                className="text-left font-semibold text-[0.68rem] uppercase tracking-wide px-4 py-2"
                style={{ color: d === mismatchDept ? 'var(--warning)' : 'var(--ink-faint)' }}
              >
                {DEPT_LABEL[d]}
                {d === mismatchDept && ' *'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-[var(--border)] last:border-b-0">
              <td className="px-4 py-2.5 text-[var(--ink-faint)] text-xs">{r.label}</td>
              {DEPT_ORDER.map((d) => (
                <td key={d} className="px-4 py-2.5 text-[var(--ink)]">
                  {byDept[d]?.[r.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewPanel({ review, verifications, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resolved, setResolved] = useState(null);

  const approve = async () => {
    setBusy(true);
    try {
      await api.approveReview(review.id, 'Officer Anita Singh');
      setResolved('confirmed');
      setTimeout(() => onApprove(), 700);
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      await api.rejectReview(review.id, 'Officer Anita Singh');
      setResolved('rejected');
      setRejecting(false);
      setTimeout(() => onReject(), 700);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)] p-6">
      {resolved ? (
        <div className="py-8 text-center">
          <p className="text-base font-semibold" style={{ color: resolved === 'confirmed' ? 'var(--success)' : 'var(--danger)' }}>
            {resolved === 'confirmed' ? 'Match confirmed' : 'Match rejected'}
          </p>
          <p className="text-sm text-[var(--ink-faint)] mt-1">
            {resolved === 'confirmed'
              ? 'Identity resolved — the application is moving to processing.'
              : 'This department record has been excluded from the identity match.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-6 mb-1">
            <div>
              <p className="eyebrow mb-1">Case {String(review.application_id).padStart(4, '0')}</p>
              <h3 className="text-lg font-semibold text-[var(--ink)]">{review.citizen_name}</h3>
              <p className="text-xs text-[var(--ink-faint)] mt-0.5">{review.scheme_name}</p>
            </div>
            <ConfidenceMeter score={review.confidence_score} label="Match confidence" />
          </div>

          <p className="eyebrow mt-6 mb-2">Source records</p>
          {verifications ? (
            <SourceRecordsTable verifications={verifications} mismatchDept={review.department} />
          ) : (
            <div className="skeleton h-24 rounded-[var(--r-md)] mb-5" />
          )}

          <Banner tone="warning" className="mb-6">
            <b>Review required —</b> {review.reason}
          </Banner>

          <div className="flex gap-3">
            <Button variant="teal" onClick={approve} loading={busy && !rejecting}>
              Approve match
            </Button>
            <Button variant="danger" onClick={() => setRejecting(true)} disabled={busy}>
              Reject match
            </Button>
          </div>
        </>
      )}

      <Modal
        open={rejecting}
        onClose={() => !busy && setRejecting(false)}
        title="Reject this identity match?"
        footer={
          <>
            <Button variant="danger" onClick={reject} loading={busy}>
              Reject match
            </Button>
            <Button variant="secondary" onClick={() => setRejecting(false)} disabled={busy}>
              Cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          The {DEPT_LABEL[review.department] || review.department} department record for{' '}
          <b className="text-[var(--ink)]">{review.citizen_name}</b> will be excluded from this application's identity
          resolution. This action is recorded in the audit trail.
        </p>
      </Modal>
    </div>
  );
}

export default function OfficerReviews() {
  const [reviews, setReviews] = useState(null);
  const [verificationsByApp, setVerificationsByApp] = useState({});

  const load = async () => {
    const list = await api.officerReviews();
    setReviews(list);
    const details = await Promise.all(list.map((r) => api.getApplication(r.application_id)));
    setVerificationsByApp(Object.fromEntries(details.map((d) => [d.id, d.verifications])));
  };

  useEffect(() => {
    load();
  }, []);

  if (!reviews) {
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Identity resolution"
        title="Review queue"
        subtitle="Ambiguous department matches that need officer confirmation before an application can proceed."
      />

      {reviews.length === 0 && (
        <EmptyState
          title="No pending identity reviews"
          description="Every department match has resolved automatically. New ambiguous matches will appear here."
        />
      )}

      <div className="space-y-5 max-w-2xl">
        {reviews.map((r) => (
          <ReviewPanel key={r.id} review={r} verifications={verificationsByApp[r.application_id]} onApprove={load} onReject={load} />
        ))}
      </div>
    </Layout>
  );
}
