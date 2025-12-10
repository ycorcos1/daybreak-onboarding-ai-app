import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isFullWidth?: boolean;
  }
>;

const variantClass: Record<ButtonVariant, string> = {
  primary: "db-btn-primary",
  secondary: "db-btn-secondary",
  ghost: "db-btn-ghost",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "db-btn-sm",
  md: "db-btn-md",
  lg: "db-btn-lg",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isFullWidth,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <>
      <button
        className={`db-btn ${variantClass[variant]} ${sizeClass[size]} ${
          isFullWidth ? "db-btn-block" : ""
        } ${className ?? ""}`}
        disabled={disabled}
        aria-disabled={disabled}
        {...rest}
      >
        {children}
      </button>
      <style jsx>{`
        .db-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-weight: 600;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease,
            background-color 120ms ease, border-color 120ms ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          font-family: var(--font-sans);
          text-decoration: none;
        }

        .db-btn-sm {
          height: 40px;
          padding: 0 16px;
          font-size: 14px;
        }

        .db-btn-md {
          height: 46px;
          padding: 0 20px;
          font-size: 15px;
        }

        .db-btn-lg {
          height: 52px;
          padding: 0 24px;
          font-size: 16px;
        }

        .db-btn-block {
          width: 100%;
        }

        .db-btn-primary {
          background: var(--color-primary-teal);
          color: #ffffff;
        }

        .db-btn-primary:hover:not(:disabled) {
          background: #00a6bb;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(0, 150, 168, 0.24);
        }

        .db-btn-secondary {
          background: var(--color-secondary-gold);
          color: #ffffff;
        }

        .db-btn-secondary:hover:not(:disabled) {
          background: #ffb632;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(244, 166, 28, 0.24);
        }

        .db-btn-ghost {
          background: transparent;
          color: var(--color-primary-teal);
          border: 1px solid var(--color-primary-teal);
          box-shadow: none;
        }

        .db-btn-ghost:hover:not(:disabled) {
          background: rgba(0, 150, 168, 0.08);
          transform: translateY(-1px);
        }

        .db-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .db-btn:focus-visible {
          outline: 3px solid rgba(0, 150, 168, 0.35);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

export default Button;

