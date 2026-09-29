/**
 * Restrained page header: eyebrow + controlled title + optional status/meta.
 * No marketing subtitle by default — `subtitle` should be a plain factual
 * sentence when used at all, never a tagline.
 */
export default function PageHeader({ eyebrow, title, subtitle, meta, actions }) {
  return (
    <header className="mb-8 pb-6 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-[var(--ink)]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--ink-muted)] max-w-xl">{subtitle}</p>}
        </div>
        {(actions || meta) && (
          <div className="flex flex-col items-end gap-2.5">
            {meta}
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
