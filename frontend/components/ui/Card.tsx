import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  padding?: string;
  onClick?: () => void;
  role?: string;
}>;

export function Card({ children, className, padding = "24px", onClick, role }: CardProps) {
  return (
    <>
      <div
        className={`db-card ${className ?? ""}`}
        style={{ padding }}
        onClick={onClick}
        role={role}
      >
        {children}
      </div>
      <style jsx>{`
        .db-card {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          box-shadow: var(--shadow-soft);
          cursor: ${onClick ? "pointer" : "default"};
        }
      `}</style>
    </>
  );
}

export default Card;

