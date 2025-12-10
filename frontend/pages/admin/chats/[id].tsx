import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ChatConsole from "@/components/admin/ChatConsole";
import { ADMIN_CHAT_QUERY } from "@/lib/graphql/queries/chats";
import { SEND_ADMIN_CHAT_MESSAGE_MUTATION } from "@/lib/graphql/mutations/chats";

type ChatMessage = {
  id: string;
  senderType: string;
  messageText: string;
  createdAt: string;
};

type ChatThread = {
  id: string;
  referralId?: string | null;
  parentUserId: string;
  mode?: string | null;
  supportChatMessages: ChatMessage[];
};

type AdminChatResult = {
  adminChat: ChatThread | null;
};

export default function AdminChatDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const chatId = typeof id === "string" ? id : undefined;
  const [messageText, setMessageText] = useState("");

  const { data, loading, error, refetch, startPolling, stopPolling } =
    useQuery<AdminChatResult>(ADMIN_CHAT_QUERY, {
      variables: { id: chatId },
      skip: !chatId,
      pollInterval: 0,
    });

  useEffect(() => {
    if (!chatId) return;
    startPolling(5000);
    return () => stopPolling();
  }, [chatId, startPolling, stopPolling]);

  const [sendMessage, { loading: sending }] = useMutation(
    SEND_ADMIN_CHAT_MESSAGE_MUTATION,
    {
      onCompleted: () => {
        setMessageText("");
        void refetch();
      },
    },
  );

  const chat = data?.adminChat;

  const handleSend = async () => {
    if (!messageText.trim() || !chatId) return;
    await sendMessage({ variables: { chatId, messageText } });
  };

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout title={`Chat ${chat ? `#${chat.id}` : ""}`}>
        <div className="page">
          {loading && <p className="muted">Loading chat…</p>}
          {error && <p className="error">Unable to load chat.</p>}
          {!loading && !error && !chat ? <p>Chat not found.</p> : null}

          {chat ? (
            <>
              <div className="summary">
                <div>
                  <p className="eyebrow">Support chat</p>
                  <h1>Chat #{chat.id}</h1>
                  <p className="muted">
                    Parent {chat.parentUserId}
                    {chat.referralId ? ` · Referral ${chat.referralId}` : " · General"}
                  </p>
                </div>
                <button className="text-button" type="button" onClick={() => void refetch()}>
                  Refresh
                </button>
              </div>

              <ChatConsole
                messages={chat.supportChatMessages}
                messageText={messageText}
                onMessageChange={setMessageText}
                onSend={handleSend}
                sending={sending}
              />
            </>
          ) : null}
        </div>

        <style jsx>{`
          .page {
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .eyebrow {
            color: var(--color-primary-teal);
            font-weight: 700;
            margin: 0 0 6px;
          }

          h1 {
            margin: 0 0 4px;
            color: var(--color-deep-aqua);
          }

          .muted {
            color: var(--color-muted);
            margin: 0;
          }

          .error {
            color: var(--color-accent-red);
          }

          .text-button {
            border: none;
            background: transparent;
            color: var(--color-primary-teal);
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

