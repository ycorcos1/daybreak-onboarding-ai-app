import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import useReferral from "@/hooks/useReferral";
import { REQUEST_REFERRAL_DELETION_MUTATION } from "@/lib/graphql/mutations/requestReferralDeletion";
import ReferralDetailSummary from "@/components/parent/ReferralDetailSummary";

export default function ReferralIndexPage() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = (id as string) || "";

  const { referral, loading, error, refetch } = useReferral(referralId, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network",
  });

  const [requestDeletion, { loading: requestingDeletion }] = useMutation(
    REQUEST_REFERRAL_DELETION_MUTATION,
  );

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const statusLabel = useMemo(
    () => referral?.status?.replace(/_/g, " ") || "submitted",
    [referral?.status],
  );

  const packetStatus = referral?.packetStatus || "not_generated";
  const deletionRequested = Boolean(referral?.deletionRequestedAt);
  const deleted = referral?.status === "deleted";

  const handleDeletionRequest = async () => {
    if (!referralId) return;
    const confirmed = window.confirm(
      "Request deletion of this referral? This requires admin approval and will permanently remove referral data once approved.",
    );
    if (!confirmed) return;

    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await requestDeletion({
        variables: { referralId },
      });
      const result = response.data?.requestReferralDeletion;
      if (result?.errors?.length) {
        setActionError(result.errors.join(", "));
        return;
      }
      setActionSuccess(
        "Deletion request submitted. An admin will review and confirm.",
      );
      void refetch();
    } catch (e) {
      setActionError("Unable to submit deletion request. Please try again.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          Loading referral…
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !referral) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <p>Unable to load this referral.</p>
          <Button onClick={() => router.push("/parent/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireRole="parent">
      <div className="details-shell">
        <header className="details-header">
          <div>
            <p className="eyebrow">Referral #{referral.id}</p>
            <h1>Referral summary</h1>
            <p className="muted">
              Review your submitted details or request deletion.
            </p>
          </div>
          <div className="status-tags">
            <span className="badge">{`Status: ${statusLabel}`}</span>
            <span className="badge badge--muted">{`Packet: ${packetStatus}`}</span>
            {deletionRequested ? (
              <span className="badge badge--warning">Deletion requested</span>
            ) : null}
            {deleted ? <span className="badge badge--danger">Deleted</span> : null}
          </div>
        </header>

        {(actionError || actionSuccess) && (
          <div className={`alert ${actionError ? "alert--error" : "alert--success"}`}>
            {actionError || actionSuccess}
          </div>
        )}

        <Card padding="20px">
          <ReferralDetailSummary referral={referral} />
        </Card>

        <div className="actions">
          <Button variant="secondary" onClick={() => router.push("/parent/dashboard")}>
            Back to dashboard
          </Button>
          <div className="spacer" />
          <Button variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
          <Button
            variant="ghost"
            disabled={deletionRequested || deleted}
            onClick={handleDeletionRequest}
          >
            {deletionRequested ? "Deletion requested" : "Request deletion"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .details-shell {
          max-width: 1040px;
          margin: 0 auto;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
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
          margin: 0;
          color: var(--color-muted);
        }

        .status-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0, 150, 168, 0.12);
          color: var(--color-deep-aqua);
          font-weight: 600;
        }

        .badge--muted {
          background: #f1f3f5;
          color: var(--color-text);
        }

        .badge--warning {
          background: #fff4ec;
          color: #b86800;
        }

        .badge--danger {
          background: #ffe9e9;
          color: #b30000;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .spacer {
          flex: 1 1 auto;
        }

        .alert {
          padding: 12px 14px;
          border-radius: 10px;
          font-weight: 600;
        }

        .alert--error {
          background: #ffe9e9;
          color: #b30000;
        }

        .alert--success {
          background: #e9f8f1;
          color: #1c8554;
        }

        @media (max-width: 768px) {
          .details-shell {
            padding: 24px 12px 48px;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}


