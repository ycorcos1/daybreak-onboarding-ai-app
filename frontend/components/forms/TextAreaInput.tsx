import { TextareaHTMLAttributes } from "react";

type TextAreaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: string;
  error?: string;
};

export function TextAreaInput({
  id,
  label,
  helperText,
  error,
  required,
  rows = 4,
  ...rest
}: TextAreaInputProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="textarea-field">
      <label className="db-input-label" htmlFor={id}>
        {label}
        {required ? <span className="db-required">*</span> : null}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={`db-textarea ${error ? "db-input-error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperId}
        required={required}
        {...rest}
      />
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

        .db-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: #ffffff;
          color: var(--color-text);
          font-size: 15px;
          min-height: 120px;
          resize: vertical;
          transition:
            border-color 120ms ease,
            box-shadow 120ms ease;
        }

        .db-textarea:focus {
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

export default TextAreaInput;
