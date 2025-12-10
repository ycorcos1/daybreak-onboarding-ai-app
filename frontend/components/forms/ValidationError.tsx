type ValidationErrorProps = {
  message?: string;
};

export function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null;
  return (
    <div className="validation-error" role="alert" aria-live="assertive">
      {message}
      <style jsx>{`
        .validation-error {
          background: rgba(255, 75, 75, 0.1);
          color: var(--color-accent-red);
          border: 1px solid var(--color-accent-red);
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default ValidationError;
