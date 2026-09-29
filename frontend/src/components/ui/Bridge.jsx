/**
 * SETU's signature visual motif: a bridge rule with two endpoints and a
 * central mark — "SYSTEM A ── SETU ── SYSTEM B". Used sparingly (login,
 * dashboard "connected through" strip). Not decorative chrome — the line
 * literally represents departments that stay separate, joined by SETU.
 */
export function BridgeRule({ label = 'SETU', className = '' }) {
  return (
    <div className={`bridge-rule ${className}`} aria-hidden="true">
      <span className="bridge-node" />
      <span className="font-mono-setu text-[0.68rem] tracking-[0.15em] text-[var(--ink-faint)] uppercase shrink-0">
        {label}
      </span>
      <span className="bridge-node" />
    </div>
  );
}

/**
 * Compact "connected through SETU" status strip: three departments feeding
 * into one unified state. Deliberately plain — a status list, not an
 * architecture diagram or an animated data-flow graphic.
 */
export function ConnectedThrough({ departments }) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)] overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
        {departments.map((d) => (
          <div key={d.name} className="px-4 py-3">
            <p className="text-[0.72rem] font-semibold text-[var(--ink)]">{d.name}</p>
            <p className="text-[0.68rem] text-[var(--ink-faint)] font-mono-setu mt-0.5">{d.protocol}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: d.connected ? 'var(--success)' : 'var(--border-strong)' }}
              />
              <span className="text-[0.68rem] text-[var(--ink-muted)]">{d.connected ? 'Connected' : 'Not connected'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)] px-4 py-2 bg-[var(--surface-sunken)] flex items-center justify-between">
        <span className="text-[0.68rem] text-[var(--ink-faint)]">{departments.length} departmental systems</span>
        <span className="text-[0.68rem] font-medium text-[var(--ink-muted)]">1 unified application</span>
      </div>
    </div>
  );
}
