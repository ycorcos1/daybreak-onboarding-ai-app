import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";

export type ScreenerMessage = {
  role: "user" | "assistant";
  content: string;
  crisis?: boolean;
  timestamp?: string;
};

type ScreenerChatProps = {
  messages: ScreenerMessage[];
  onSendMessage: (message: string) => Promise<void> | void;
  onComplete: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  crisisDetected?: boolean;
  completed?: boolean;
  error?: string | null;
  onClearError?: () => void;
  emergencyMessage?: string;
};

const QUICK_PROMPTS = [
  "School avoidance and missing classes",
  "Big mood swings at home",
  "Having trouble sleeping and eating",
];

export default function ScreenerChat({
  messages,
  onSendMessage,
  onComplete,
  loading = false,
  disabled = false,
  crisisDetected = false,
  completed = false,
  error,
  onClearError,
  emergencyMessage = "If you or your child are in crisis or considering self-harm, please call 911 or go to the nearest emergency room. You can also call or text 988 to reach the Suicide & Crisis Lifeline.",
}: ScreenerChatProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const isInputDisabled = disabled || loading || completed || crisisDetected;

  const sortedMessages = useMemo(() => messages ?? [], [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [sortedMessages, loading]);

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isInputDisabled) return;
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onClearError?.();
    await onSendMessage(text);
  };

  const showQuickPrompts = sortedMessages.length === 0;

  return (
    <div className="screener-chat">
      <div className="intro">
        <p className="eyebrow">Step 3 · AI screener</p>
        <h2>Tell us what&apos;s happening</h2>
        <p className="muted">
          This screener helps us understand your child in your own words. It isn’t a diagnosis and
          isn’t for emergencies. If you need urgent help, call 911 or text 988.
        </p>
      </div>

      {crisisDetected && (
        <div className="crisis-banner" role="alert" aria-live="assertive">
          <strong>Emergency notice:</strong> {emergencyMessage} If this is an emergency, call 911 or
          go to the nearest ER.
        </div>
      )}

      {error ? (
        <div className="error-banner" role="alert">
          <p>{error}</p>
          {onClearError ? (
            <button type="button" className="link-button" onClick={onClearError}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="chat-card">
        <div className="chat-list" ref={listRef} aria-live="polite">
          {sortedMessages.map((message, idx) => (
            <div
              key={`${message.timestamp || idx}-${idx}`}
              className={`bubble ${message.role} ${message.crisis ? "crisis" : ""}`}
            >
              <div className="bubble-meta">
                {message.role === "assistant" ? "Daybreak Assistant" : "You"}
                {message.timestamp ? (
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                ) : null}
              </div>
              <p className="bubble-text">{message.content}</p>
            </div>
          ))}
          {loading ? <div className="typing">AI is typing…</div> : null}
        </div>

        <form className="input-row" onSubmit={handleSend}>
          <label htmlFor="screener-input" className="sr-only">
            Describe what&apos;s happening
          </label>
          <textarea
            id="screener-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share what you’ve noticed—behaviors, changes, worries..."
            rows={3}
            disabled={isInputDisabled}
          />
          <div className="actions">
            <div className="quick-prompts" aria-label="Quick prompts">
              {showQuickPrompts
                ? QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="chip"
                      onClick={() => {
                        setDraft(prompt);
                        onClearError?.();
                      }}
                      disabled={isInputDisabled}
                    >
                      {prompt}
                    </button>
                  ))
                : null}
            </div>
            <div className="buttons">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onComplete()}
                disabled={loading || completed || sortedMessages.filter((m) => m.role === "user").length < 1}
              >
                I&apos;m done
              </Button>
              <Button type="submit" disabled={isInputDisabled}>
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>

      {completed ? (
        <div className="completion-note" role="status">
          We&apos;ve created a summary of your conversation. You can continue if you want to add more,
          but this step is ready to move forward.
        </div>
      ) : null}

      <style jsx>{`
        .screener-chat {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .intro .eyebrow {
          margin: 0;
          color: var(--color-primary-teal);
          font-weight: 700;
        }
        .intro h2 {
          margin: 4px 0 6px;
          color: var(--color-deep-aqua);
        }
        .intro .muted {
          margin: 0;
          color: var(--color-muted);
        }

        .chat-card {
          background: #faf3ec;
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-list {
          max-height: 360px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 8px;
        }

        .bubble {
          max-width: 82%;
          border-radius: 12px;
          padding: 10px 12px;
          background: #fff4ec;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .bubble.user {
          align-self: flex-end;
          background: #fff;
          border: 1px solid var(--color-border);
        }

        .bubble.assistant {
          align-self: flex-start;
          background: rgba(0, 150, 168, 0.08);
        }

        .bubble.crisis {
          border: 1px solid #ff4b4b;
          background: #fff6f6;
        }

        .bubble-meta {
          font-size: 12px;
          color: var(--color-muted);
          display: flex;
          gap: 6px;
          align-items: center;
          margin-bottom: 2px;
        }

        .timestamp {
          color: var(--color-muted);
        }

        .bubble-text {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .typing {
          font-size: 13px;
          color: var(--color-muted);
        }

        .input-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          padding: 12px;
          font-size: 15px;
          resize: vertical;
          min-height: 110px;
          background: #fff;
        }

        textarea:focus {
          outline: 2px solid rgba(0, 150, 168, 0.35);
          border-color: var(--color-primary-teal);
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-prompts {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip {
          border: 1px solid var(--color-border);
          background: #fff;
          border-radius: 999px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .chip:hover:not(:disabled) {
          border-color: var(--color-primary-teal);
          color: var(--color-deep-aqua);
        }

        .chip:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .crisis-banner {
          border: 1px solid #ff4b4b;
          background: #fff6f6;
          color: #5c1f1f;
          padding: 12px;
          border-radius: 10px;
        }

        .error-banner {
          border: 1px solid #ff4b4b;
          background: #fff6f6;
          color: #5c1f1f;
          padding: 10px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: space-between;
        }

        .link-button {
          background: none;
          border: none;
          color: var(--color-primary-teal);
          cursor: pointer;
          font-weight: 600;
        }

        .completion-note {
          background: #f0fbfc;
          border: 1px solid rgba(0, 150, 168, 0.25);
          color: #006876;
          padding: 10px 12px;
          border-radius: 10px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @media (max-width: 768px) {
          .chat-list {
            max-height: 320px;
          }

          .bubble {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}


