const VARIANTS = {
  primary:
    'bg-[var(--ink-900)] text-white hover:bg-[var(--ink-800)] active:bg-[var(--ink-950)] border border-transparent',
  teal:
    'bg-[var(--teal-700)] text-white hover:bg-[var(--teal-600)] active:bg-[var(--teal-700)] border border-transparent',
  secondary:
    'bg-transparent text-[var(--ink)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] active:bg-[var(--border)]',
  ghost:
    'bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] active:bg-[var(--border)] border border-transparent',
  danger:
    'bg-transparent text-[var(--danger)] border border-[var(--danger)]/40 hover:bg-[var(--danger-tint)] active:bg-[var(--danger-tint)]',
};

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-[0.85rem] px-3.5 py-2 gap-2',
  lg: 'text-[0.9rem] px-4 py-2.5 gap-2',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const isButtonEl = Tag === 'button';
  return (
    <Tag
      disabled={isButtonEl ? disabled || loading : undefined}
      aria-disabled={!isButtonEl && (disabled || loading) ? true : undefined}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--r-sm)] transition-colors duration-[120ms] ease-out disabled:opacity-45 disabled:pointer-events-none ${
        !isButtonEl && (disabled || loading) ? 'opacity-45 pointer-events-none' : ''
      } ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin opacity-70" />
      )}
      {children}
    </Tag>
  );
}
