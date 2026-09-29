/** Status vocabulary shared across the whole app. Rectangular tag, not a pill —
 * a small left rule communicates tone instead of a colored dot/background wash. */
const TONES = {
  neutral: { fg: 'var(--ink-muted)', bar: 'var(--border-strong)' },
  progress: { fg: 'var(--teal-700)', bar: 'var(--teal-600)' },
  review: { fg: 'var(--warning)', bar: 'var(--warning)' },
  success: { fg: 'var(--success)', bar: 'var(--success)' },
  danger: { fg: 'var(--danger)', bar: 'var(--danger)' },
};

const STATUS_MAP = {
  draft: ['Draft', 'neutral'],
  awaiting_consent: ['Awaiting consent', 'review'],
  verifying: ['Verifying', 'progress'],
  identity_review: ['Identity review', 'review'],
  ready_for_processing: ['Ready for processing', 'success'],
  approved: ['Approved', 'success'],
  cancelled: ['Cancelled', 'danger'],
  verified: ['Verified', 'success'],
  failed: ['Failed', 'danger'],
  pending: ['Pending', 'neutral'],
  auto_confirmed: ['Auto-confirmed', 'success'],
  pending_review: ['Review required', 'review'],
  confirmed: ['Confirmed', 'success'],
  rejected: ['Rejected', 'danger'],
};

export default function Badge({ status, tone, children, className = '' }) {
  let label = children;
  let resolvedTone = tone || 'neutral';
  if (status && STATUS_MAP[status]) {
    const [l, t] = STATUS_MAP[status];
    label = children || l;
    resolvedTone = tone || t;
  }
  const { fg, bar } = TONES[resolvedTone] || TONES.neutral;
  return (
    <span
      className={`tag border-l-2 bg-[var(--surface-sunken)] ${className}`}
      style={{ color: fg, borderLeftColor: bar }}
    >
      {label}
    </span>
  );
}
