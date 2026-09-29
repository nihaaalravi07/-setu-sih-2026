/** A restrained content section: small uppercase label, optional title, content. No card wrapper. */
export default function Section({ label, title, action, className = '', children }) {
  return (
    <section className={`mb-9 ${className}`}>
      {(label || title || action) && (
        <div className="flex items-end justify-between mb-3 gap-4">
          <div>
            {label && <p className="eyebrow mb-1">{label}</p>}
            {title && <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
