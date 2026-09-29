function toneFor(score) {
  if (score >= 90) return { color: 'var(--success)', label: 'High confidence' };
  if (score >= 55) return { color: 'var(--warning)', label: 'Review required' };
  return { color: 'var(--danger)', label: 'Low confidence' };
}

/**
 * Compact confidence indicator — a number and a thin rule, not an animated
 * "AI scanning" gauge. `resolved` lets a human decision (officer approve/
 * reject) override the raw-score tone once a case has actually been closed.
 */
export default function ConfidenceMeter({ score, label = 'Match confidence', resolved, showToneLabel = true }) {
  const { color: scoreColor, label: scoreLabel } = toneFor(score);
  const color = resolved === 'confirmed' ? 'var(--success)' : resolved === 'rejected' ? 'var(--danger)' : scoreColor;
  const toneLabel = resolved === 'confirmed' ? 'Confirmed by officer' : resolved === 'rejected' ? 'Rejected by officer' : scoreLabel;

  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-mono-setu text-2xl font-semibold tabular-nums text-[var(--ink)]">{score}%</span>
        {showToneLabel && (
          <span className="text-[0.72rem] font-medium" style={{ color }}>
            {toneLabel}
          </span>
        )}
      </div>
      <div className="w-full max-w-[180px] h-[3px] bg-[var(--surface-sunken)] rounded-full overflow-hidden mt-2">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}
