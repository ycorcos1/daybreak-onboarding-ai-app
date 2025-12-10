import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MY_NOTIFICATIONS_QUERY } from "@/lib/graphql/queries/myNotifications";
import { MARK_NOTIFICATION_READ_MUTATION } from "@/lib/graphql/mutations/markNotificationRead";

type Notification = {
  id: string;
  userId: string;
  referralId?: string | null;
  notificationType: string;
  payloadJsonb: Record<string, any>;
  readAt?: string | null;
  createdAt: string;
};

type NotificationsResult = {
  myNotifications: Notification[];
};

export default function NotificationsPage() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<NotificationsResult>(
    MY_NOTIFICATIONS_QUERY,
    { variables: { unreadOnly } },
  );

  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    refetchQueries: [
      { query: MY_NOTIFICATIONS_QUERY, variables: { unreadOnly: true } },
      { query: MY_NOTIFICATIONS_QUERY, variables: { unreadOnly: false } },
    ],
  });

  const notifications = data?.myNotifications ?? [];

  const handleMarkRead = async (notificationId: string) => {
    try {
      setActionError(null);
      await markRead({ variables: { notificationId } });
    } catch {
      setActionError("Unable to mark notification as read. Please try again.");
    }
  };

  return (
    <ProtectedRoute requireRole="parent">
      <div className="page">
        <header className="header">
          <div>
            <p className="eyebrow">Notifications</p>
            <h1>Your updates</h1>
            <p className="muted">
              Stay up to date on referrals, status changes, and requests.
            </p>
          </div>
          <div className="header-actions">
            <label className="toggle">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              <span>Show unread only</span>
            </label>
            <Button variant="ghost" onClick={() => void refetch()}>
              Refresh
            </Button>
          </div>
        </header>

        {actionError ? <p className="error-text">{actionError}</p> : null}
        {loading && <p className="muted">Loading notifications…</p>}
        {error && (
          <p className="error-text">
            Unable to load notifications. Please try again.
          </p>
        )}
        {!loading && !error && notifications.length === 0 ? (
          <Card className="empty-card">
            <h3>No notifications</h3>
            <p className="muted">You’ll see updates here once activity occurs.</p>
          </Card>
        ) : null}

        <div className="list">
          {notifications.map((notification) => {
            const payload = notification.payloadJsonb || {};
            const title = payload.title || formatType(notification.notificationType);
            const message =
              payload.message || payload.body || "You have a new notification.";
            const isUnread = !notification.readAt;
            const createdAt = formatDate(notification.createdAt);

            return (
              <Card
                key={notification.id}
                className={`notification ${isUnread ? "notification--unread" : ""}`}
                padding="16px"
              >
                <div className="notification__header">
                  <div>
                    <p className="eyebrow">{title}</p>
                    <p className="muted">{createdAt}</p>
                  </div>
                  <div className="actions">
                    {notification.referralId ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/parent/referrals/${notification.referralId}`)
                        }
                      >
                        View referral
                      </Button>
                    ) : null}
                    {isUnread ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleMarkRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="message">{message}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 18px 64px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        h1 {
          margin: 0 0 6px;
          color: var(--color-deep-aqua);
        }

        .muted {
          color: var(--color-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--color-text);
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notification {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }

        .notification--unread {
          border-color: var(--color-primary-teal);
          background: #e6f7fa;
        }

        .notification__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .message {
          margin: 8px 0 0;
          color: var(--color-text);
        }

        .error-text {
          color: var(--color-accent-red);
          margin: 0;
        }

        .empty-card {
          background: #fff;
        }
      `}</style>
    </ProtectedRoute>
  );
}

function formatType(type: string) {
  return type.replace(/_/g, " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}


