const STEPS = ['Application', 'Consent', 'Verification', 'Review', 'Complete'];

/** Maps an application's backend status to a step index (0-based) in STEPS. */
export function stepIndexForStatus(status) {
  switch (status) {
    case 'awaiting_consent':
      return 0;
    case 'verifying':
      return 2;
    case 'identity_review':
      return 3;
    case 'ready_for_processing':
    case 'approved':
      return 4;
    case 'cancelled':
      return 1;
    default:
      return 0;
  }
}

/** Restrained numbered stepper — a case-file progress line, not an animated bar. */
export default function ProgressSteps({ currentIndex }) {
  return (
    <ol className="flex items-stretch border border-[var(--border)] rounded-[var(--r-md)] overflow-x-auto min-w-0">
      {STEPS.map((label, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming';
        return (
          <li
            key={label}
            className="flex-1 min-w-[92px] px-3 py-2.5 border-r border-[var(--border)] last:border-r-0"
            style={{ background: state === 'active' ? 'var(--surface-sunken)' : 'transparent' }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="font-mono-setu text-[0.65rem] tabular-nums"
                style={{ color: state === 'upcoming' ? 'var(--ink-faint)' : 'var(--ink-muted)' }}
              >
                0{i + 1}
              </span>
              {state === 'done' && <span className="text-[0.65rem]" style={{ color: 'var(--success)' }}>✓</span>}
            </div>
            <p
              className="text-[0.78rem] mt-0.5"
              style={{
                color: state === 'upcoming' ? 'var(--ink-faint)' : 'var(--ink)',
                fontWeight: state === 'active' ? 600 : 500,
              }}
            >
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
