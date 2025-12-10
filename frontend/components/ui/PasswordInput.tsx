import { ComponentProps, useState } from "react";
import { TextInput } from "./TextInput";

type PasswordInputProps = Omit<ComponentProps<typeof TextInput>, "type">;

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const toggle = () => setShow((prev) => !prev);

  return (
    <div className="db-password-wrapper">
      <TextInput
        {...props}
        type={show ? "text" : "password"}
        autoComplete={show ? "off" : "current-password"}
      />
      <button
        type="button"
        className="db-password-toggle"
        onClick={toggle}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
      <style jsx>{`
        .db-password-wrapper {
          position: relative;
          width: 100%;
        }

        .db-password-toggle {
          position: absolute;
          top: 30px;
          bottom: 0;
          right: 12px;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: transparent;
          border: none;
          color: var(--color-primary-teal);
          font-weight: 600;
          line-height: 1;
          cursor: pointer;
        }

        .db-password-toggle:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.4);
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}

export default PasswordInput;
