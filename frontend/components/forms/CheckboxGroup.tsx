type CheckboxOption = { value: string; label: string };

type CheckboxGroupProps = {
  name: string;
  label: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  helperText?: string;
};

export function CheckboxGroup({
  name,
  label,
  options,
  selectedValues,
  onChange,
  error,
  helperText,
}: CheckboxGroupProps) {
  const toggle = (value: string) => {
    const exists = selectedValues.includes(value);
    if (exists) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <fieldset className="checkbox-group" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="db-input-label">{label}</legend>
      <div className="checkbox-options">
        {options.map((opt) => (
          <label key={opt.value} className="checkbox-option">
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              checked={selectedValues.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {helperText && !error ? <p className="db-input-helper">{helperText}</p> : null}
      {error ? (
        <p className="db-input-error-text" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
      <style jsx>{`
        .db-input-label {
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--color-deep-aqua);
        }

        .checkbox-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px 12px;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text);
          font-weight: 500;
        }

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
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
    </fieldset>
  );
}

export default CheckboxGroup;
