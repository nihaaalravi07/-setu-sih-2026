const TONE_BY_TYPE = {
  consent_denied: 'var(--danger)',
  identity_review_required: 'var(--warning)',
  identity_review_rejected: 'var(--danger)',
  identity_review_approved: 'var(--success)',
  identity_resolved: 'var(--success)',
  ready_for_processing: 'var(--success)',
};

/** Plain event log — a case-file record, not an animated activity feed. */
export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-[var(--ink-faint)]">No activity recorded yet.</p>;
  }

  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)] overflow-hidden">
      {events.map((e, i) => (
        <div
          key={e.id}
          className="flex items-start gap-4 px-4 py-2.5 border-b border-[var(--border)] last:border-b-0"
          style={{ background: i % 2 === 1 ? 'var(--surface-sunken)' : 'transparent' }}
        >
          <time className="font-mono-setu text-xs text-[var(--ink-faint)] shrink-0 pt-0.5 w-[70px]">
            {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </time>
          <span
            className="w-1 h-1 rounded-full shrink-0 mt-2"
            style={{ background: TONE_BY_TYPE[e.type] || 'var(--border-strong)' }}
          />
          <p className="text-sm text-[var(--ink)] leading-snug flex-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
}
