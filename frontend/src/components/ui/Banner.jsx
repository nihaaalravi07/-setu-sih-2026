const TONES = {
  success: { bg: 'var(--success-tint)', fg: 'var(--success)' },
  warning: { bg: 'var(--warning-tint)', fg: 'var(--warning)' },
  danger: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
};

/** One consistent inline alert treatment — tint background, left rule, same
 * radius/padding everywhere — used for consent/verification/error messages. */
export default function Banner({ tone = 'warning', children, className = '' }) {
  const { bg, fg } = TONES[tone] || TONES.warning;
  return (
    <div
      className={`rounded-[var(--r-sm)] px-4 py-3 text-sm border-l-2 leading-relaxed ${className}`}
      style={{ background: bg, color: fg, borderLeftColor: fg }}
    >
      {children}
    </div>
  );
}
