import Button from "@/components/ui/Button";

type Message = {
  id: string;
  senderType: string;
  messageText: string;
  createdAt: string;
};

type ChatConsoleProps = {
  messages: Message[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
};

export default function ChatConsole({
  messages,
  messageText,
  onMessageChange,
  onSend,
  sending,
}: ChatConsoleProps) {
  return (
    <div className="console">
      <div className="transcript" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message--${msg.senderType}`}>
            <div className="message-header">
              <span className="sender">{formatSender(msg.senderType)}</span>
              <span className="time">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <p className="text">{msg.messageText}</p>
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your response..."
          rows={3}
        />
        <Button onClick={onSend} disabled={sending || !messageText.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>

      <style jsx>{`
        .console {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transcript {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px;
          background: #fff;
          max-height: 540px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .message {
          padding: 10px 12px;
          border-radius: 10px;
          max-width: 80%;
        }

        .message--parent {
          align-self: flex-end;
          background: #e3f2fd;
        }

        .message--admin {
          align-self: flex-start;
          background: #fff3e0;
        }

        .message--ai {
          align-self: flex-start;
          background: #f2f2f2;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .sender {
          font-weight: 700;
          color: var(--color-deep-aqua);
        }

        .time {
          color: var(--color-muted);
        }

        .text {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-text);
        }

        .input-area {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        textarea {
          flex: 1;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 10px;
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
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

function formatSender(sender: string) {
  if (sender === "parent") return "Parent";
  if (sender === "admin") return "Admin";
  if (sender === "ai") return "AI Assistant";
  return sender;
}

