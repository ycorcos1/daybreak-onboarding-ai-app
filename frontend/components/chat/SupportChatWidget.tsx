import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import ChatTranscript from "./ChatTranscript";
import ChatInput from "./ChatInput";
import { MY_SUPPORT_CHATS_QUERY } from "@/lib/graphql/queries/chats";
import { SEND_SUPPORT_MESSAGE_MUTATION } from "@/lib/graphql/mutations/chats";

type SupportChatWidgetProps = {
  referralId?: string;
};

type ChatMessage = {
  id: string;
  senderType: string;
  messageText: string;
  createdAt: string;
};

type ChatThread = {
  id: string;
  referralId?: string | null;
  mode?: string | null;
  supportChatMessages: ChatMessage[];
};

type MyChatsResult = {
  mySupportChats: ChatThread[];
};

export default function SupportChatWidget({ referralId }: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<MyChatsResult>(
    MY_SUPPORT_CHATS_QUERY,
    {
      variables: { referralId },
      skip: !isOpen,
      pollInterval: 0,
    },
  );

  useEffect(() => {
    if (isOpen) {
      startPolling(3000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen, startPolling, stopPolling]);

  const [sendMessage, { loading: sending }] = useMutation(SEND_SUPPORT_MESSAGE_MUTATION, {
    onCompleted: () => {
      setMessageText("");
      void refetch();
    },
  });

  const chats = data?.mySupportChats ?? [];
  const currentChat = useMemo(() => chats[0], [chats]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage({
      variables: {
        referralId,
        messageText,
      },
    });
  };

  return (
    <>
      {!isOpen ? (
        <button className="chat-pill" type="button" onClick={() => setIsOpen(true)}>
          💬 Need help?
        </button>
      ) : (
        <div className="chat-drawer">
          <div className="drawer-header">
            <div>
              <p className="eyebrow">Support chat</p>
              <h4>We’re here to help</h4>
              <p className="muted">
                Not for emergencies. If this is a crisis, please call 911 or 988.
              </p>
            </div>
            <button className="close-btn" type="button" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="drawer-body">
            {loading && <p className="muted">Loading messages…</p>}
            {error && <p className="error">Unable to load chat.</p>}
            {!loading && !currentChat && (
              <p className="muted">
                Ask a question about the process, forms, insurance, or scheduling. We’ll respond here.
              </p>
            )}
            {currentChat ? (
              <ChatTranscript messages={currentChat.supportChatMessages} />
            ) : null}
          </div>

          <div className="drawer-footer">
            <ChatInput
              value={messageText}
              onChange={setMessageText}
              onSend={handleSend}
              disabled={sending}
              placeholder="Type your message…"
            />
            <p className="micro muted">Operator status: Available</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-pill {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 1000;
          background: var(--color-primary-teal);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 12px 16px;
          box-shadow: 0 10px 28px rgba(0, 150, 168, 0.28);
          font-weight: 700;
          cursor: pointer;
        }

        .chat-drawer {
          position: fixed;
          right: 18px;
          bottom: 18px;
          width: 360px;
          max-height: 70vh;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.18);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .drawer-header {
          padding: 14px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        h4 {
          margin: 4px 0;
          color: var(--color-deep-aqua);
        }

        .muted {
          color: var(--color-muted);
          margin: 0;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          margin: 0;
          font-weight: 700;
          font-size: 12px;
        }

        .drawer-body {
          padding: 14px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .drawer-footer {
          padding: 12px;
          border-top: 1px solid var(--color-border);
          background: #fafafa;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--color-muted);
          line-height: 1;
        }

        .error {
          color: var(--color-accent-red);
          margin: 0;
        }

        .micro {
          font-size: 12px;
          margin: 6px 2px 0;
        }

        @media (max-width: 520px) {
          .chat-drawer {
            width: calc(100vw - 24px);
            right: 12px;
            bottom: 12px;
          }
        }
      `}</style>
    </>
  );
}

