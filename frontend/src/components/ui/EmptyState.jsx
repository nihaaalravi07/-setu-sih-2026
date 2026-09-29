export default function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-[var(--border-strong)] rounded-[var(--r-md)] py-12 px-8 text-center">
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      {description && <p className="text-sm text-[var(--ink-faint)] mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
