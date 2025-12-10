import Button from "@/components/ui/Button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function ChatInput({ value, onChange, onSend, disabled, placeholder }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message"}
        rows={2}
        disabled={disabled}
      />
      <Button size="sm" onClick={onSend} disabled={disabled || !value.trim()}>
        Send
      </Button>

      <style jsx>{`
        .chat-input {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        textarea {
          flex: 1;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 10px;
          min-height: 64px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
        }

        textarea:focus {
          outline: none;
          border-color: var(--color-primary-teal);
          box-shadow: 0 0 0 3px rgba(0, 150, 168, 0.18);
        }
      `}</style>
    </div>
  );
}

