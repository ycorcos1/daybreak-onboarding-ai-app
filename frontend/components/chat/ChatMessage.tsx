type Message = {
  id: string;
  senderType: string;
  messageText: string;
  createdAt: string;
};

type Props = {
  message: Message;
};

export default function ChatMessage({ message }: Props) {
  const isParent = message.senderType === "parent";
  const isAI = message.senderType === "ai";

  return (
    <div className={`message ${isParent ? "message--parent" : "message--other"}`}>
      <div className="header">
        <span className="sender">{senderLabel(message.senderType)}</span>
        <span className="time">{new Date(message.createdAt).toLocaleTimeString()}</span>
      </div>
      <p className="text">{message.messageText}</p>

      <style jsx>{`
        .message {
          max-width: 78%;
          padding: 10px 12px;
          border-radius: 12px;
          background: #fff3e0;
          align-self: flex-start;
        }

        .message--parent {
          background: #e3f2fd;
          align-self: flex-end;
        }

        .message--other {
          background: ${isAI ? "#f2f2f2" : "#fff3e0"};
        }

        .header {
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
      `}</style>
    </div>
  );
}

function senderLabel(sender: string) {
  if (sender === "parent") return "You";
  if (sender === "admin") return "Support Team";
  if (sender === "ai") return "AI Assistant";
  return sender;
}

