import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--ink-950)]/35 modal-backdrop-enter"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--border-strong)] shadow-[0_8px_28px_rgba(13,20,32,0.16)] w-full ${maxWidth} modal-panel-enter outline-none`}
      >
        {title && (
          <div className="px-6 pt-5 pb-4 border-b border-[var(--border)]">
            <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-6 pt-1 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
