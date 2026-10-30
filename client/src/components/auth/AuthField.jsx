import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { getContent } from '../../data/content';

// Reusable, theme-aware text input used by every auth form. The two screen-reader
// labels for the reveal button come from siteContent ("auth.shared").
const showLabel = getContent('auth.shared.showPassword', 'Show password');
const hideLabel = getContent('auth.shared.hidePassword', 'Hide password');
export default function AuthField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error,
  hint,
  required = false,
  disabled = false,
  reveal = false,
  autoComplete,
  inputMode,
  maxLength,
  icon: Icon,
  className = '',
}) {
  const [showValue, setShowValue] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && reveal && showValue ? 'text' : type;
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-primary">
          {label}
          {required && <span className="text-accent"> *</span>}
        </label>
      )}

      <div
        className={[
          'relative flex items-center rounded-xl border bg-white transition',
          'focus-within:ring-4',
          error
            ? 'border-red-400 focus-within:ring-red-100'
            : 'border-border focus-within:border-accent focus-within:ring-accent/15',
        ].join(' ')}
      >
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 text-muted"
          />
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'min-h-12 w-full rounded-xl bg-transparent py-3 text-sm text-primary outline-none',
            'placeholder:text-muted disabled:cursor-not-allowed disabled:bg-peach/30',
            Icon ? 'pl-11' : 'pl-4',
            isPassword && reveal ? 'pr-12' : 'pr-4',
          ].join(' ')}
        />

        {isPassword && reveal && (
          <button
            type="button"
            onClick={() => setShowValue((visible) => !visible)}
            aria-label={showValue ? hideLabel : showLabel}
            className="mr-1.5 rounded-lg px-2 py-1.5 text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {showValue ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${name}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
