import { IconAlert } from './Icons.jsx';

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
      <IconAlert size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Label + text input + inline error, wired together for screen readers. */
export function TextField({ id, label, error, hint, className = '', ...inputProps }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="input"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-mute">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

export function SelectField({ id, label, error, hint, children, className = '', ...selectProps }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="input appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230E1B2C' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...selectProps}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-mute">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
