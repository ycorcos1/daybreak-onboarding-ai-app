import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import { ADMIN_CHATS_QUERY } from "@/lib/graphql/queries/chats";

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
  createdAt: string;
  updatedAt: string;
  supportChatMessages: ChatMessage[];
};

type AdminChatsResult = {
  adminChats: ChatThread[];
};

export default function AdminChatsPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery<AdminChatsResult>(
    ADMIN_CHATS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const chats = data?.adminChats ?? [];

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout title="Support chats" description="AI + human support threads with parents">
        <div className="page">
          <div className="header">
            <p className="muted">
              View all support chat threads. AI replies appear automatically; you can jump in at any time.
            </p>
            <button className="text-button" type="button" onClick={() => void refetch()}>
              Refresh
            </button>
          </div>

          {loading && <p className="muted">Loading chats…</p>}
          {error && <p className="error">Unable to load chats.</p>}

          <div className="list">
            {chats.map((chat) => {
              const lastMessage = chat.supportChatMessages[chat.supportChatMessages.length - 1];
              return (
                <Card
                  key={chat.id}
                  padding="14px"
                  className="chat-card"
                  onClick={() => router.push(`/admin/chats/${chat.id}`)}
                  role="button"
                >
                  <div className="row">
                    <div>
                      <h3>Chat #{chat.id}</h3>
                      <p className="muted">
                        Parent: {chat.parentUserId}
                        {chat.referralId ? ` · Referral ${chat.referralId}` : " · General"}
                      </p>
                    </div>
                    <span className={`pill ${chat.mode === "mixed" ? "pill--mixed" : "pill--ai"}`}>
                      {chat.mode || "ai"}
                    </span>
                  </div>
                  {lastMessage ? (
                    <p className="last">
                      <strong>{formatSender(lastMessage.senderType)}:</strong>{" "}
                      {lastMessage.messageText.slice(0, 140)}
                    </p>
                  ) : (
                    <p className="muted">No messages yet</p>
                  )}
                  <p className="meta">
                    {chat.supportChatMessages.length} messages · Updated{" "}
                    {new Date(chat.updatedAt).toLocaleString()}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          .page {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          h3 {
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

          .list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .chat-card {
            cursor: pointer;
            background: #fff;
          }

          .chat-card:hover {
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          }

          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
          }

          .pill {
            padding: 4px 10px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 12px;
          }

          .pill--ai {
            background: #e3f2fd;
            color: #0b5ed7;
          }

          .pill--mixed {
            background: #fff3e0;
            color: #c26a00;
          }

          .last {
            margin: 8px 0 4px;
            color: var(--color-text);
          }

          .meta {
            margin: 0;
            color: var(--color-muted);
            font-size: 13px;
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function formatSender(sender: string) {
  if (sender === "parent") return "Parent";
  if (sender === "admin") return "Admin";
  if (sender === "ai") return "AI";
  return sender;
}

