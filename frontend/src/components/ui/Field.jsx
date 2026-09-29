import { useId } from 'react';

/**
 * Labeled form field — input or textarea, with a properly associated
 * label (via useId), a visible focus ring (not just a border-color
 * change), and optional hint/error text. One shared implementation so
 * every form in the app looks and behaves identically.
 */
export default function Field({ label, hint, error, as: Tag = 'input', id, className = '', ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const describedBy = error || hint ? `${fieldId}-desc` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="field-label">
          {label}
        </label>
      )}
      <Tag
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`field-input ${error ? 'field-input-error' : ''}`}
        {...rest}
      />
      {(error || hint) && (
        <p id={describedBy} className={`field-hint ${error ? 'field-hint-error' : ''}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
