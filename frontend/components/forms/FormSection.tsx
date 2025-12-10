import { PropsWithChildren } from "react";

type FormSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="form-section">
      <header className="form-section__header">
        <h3>{title}</h3>
        {description ? <p className="form-section__desc">{description}</p> : null}
      </header>
      <div className="form-section__body">{children}</div>
      <style jsx>{`
        .form-section {
          background: var(--color-warm-beige);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .form-section__header {
          margin-bottom: 10px;
        }

        .form-section__desc {
          margin: 0;
          color: var(--color-muted);
          font-size: 14px;
        }

        .form-section__body :global(.field-row) {
          margin-bottom: 14px;
        }
      `}</style>
    </section>
  );
}

export default FormSection;
