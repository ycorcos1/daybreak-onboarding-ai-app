import { SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  helperText?: string;
  error?: string;
};

export function SelectInput({
  id,
  label,
  options,
  helperText,
  error,
  required,
  ...rest
}: SelectInputProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const hasEmptyOption = options.some((opt) => opt.value === "");

  return (
    <div className="select-field">
      <label className="db-input-label" htmlFor={id}>
        {label}
        {required ? <span className="db-required">*</span> : null}
      </label>
      <select
        id={id}
        className={`db-select ${error ? "db-input-error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperId}
        required={required}
        {...rest}
      >
        {rest.defaultValue === undefined && !hasEmptyOption ? (
          <option value="">Select...</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && !error ? (
        <p className="db-input-helper" id={helperId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="db-input-error-text" id={errorId}>
          {error}
        </p>
      ) : null}
      <style jsx>{`
        .db-input-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--color-deep-aqua);
        }

        .db-required {
          color: var(--color-accent-red);
          margin-left: 4px;
        }

        .db-select {
          width: 100%;
          height: 46px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: #ffffff;
          color: var(--color-text);
          font-size: 15px;
          transition:
            border-color 120ms ease,
            box-shadow 120ms ease;
        }

        .db-select:focus {
          border-color: var(--color-primary-teal);
          box-shadow: 0 0 0 3px rgba(0, 150, 168, 0.2);
          outline: none;
        }

        .db-input-error {
          border-color: var(--color-accent-red);
        }

        .db-input-helper {
          margin-top: 6px;
          color: var(--color-muted);
          font-size: 13px;
        }

        .db-input-error-text {
          margin-top: 6px;
          color: var(--color-accent-red);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default SelectInput;
