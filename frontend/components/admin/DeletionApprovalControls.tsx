import { useState } from "react";
import { useMutation } from "@apollo/client";
import Button from "@/components/ui/Button";
import {
  ADMIN_APPROVE_DELETION,
  ADMIN_REJECT_DELETION,
} from "@/lib/graphql/mutations/adminReferrals";

type DeletionApprovalControlsProps = {
  referralId: string;
  deletionRequestedAt: string;
  onCompleted: () => void;
};

export function DeletionApprovalControls({
  referralId,
  deletionRequestedAt,
  onCompleted,
}: DeletionApprovalControlsProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [approve, { loading: approving }] = useMutation(ADMIN_APPROVE_DELETION);
  const [reject, { loading: rejecting }] = useMutation(ADMIN_REJECT_DELETION);

  const handleApprove = async () => {
    setError(null);
    const confirmed = window.confirm(
      "Approve deletion and purge PHI for this referral? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const { data } = await approve({ variables: { referralId } });
      const result = data?.approveReferralDeletion;
      if (result?.errors?.length) {
        setError(result.errors.join(", "));
        return;
      }
      onCompleted();
    } catch (e) {
      setError("Unable to approve deletion right now.");
    }
  };

  const handleReject = async () => {
    setError(null);
    try {
      const { data } = await reject({ variables: { referralId, reason } });
      const result = data?.rejectReferralDeletion;
      if (result?.errors?.length) {
        setError(result.errors.join(", "));
        return;
      }
      onCompleted();
    } catch (e) {
      setError("Unable to reject deletion right now.");
    }
  };

  return (
    <div className="deletion-shell" role="alert">
      <div>
        <p className="title">Deletion requested</p>
        <p className="meta">
          Requested at {new Date(deletionRequestedAt).toLocaleString()}.
          Approving will permanently purge PHI for this referral.
        </p>
      </div>
      <div className="actions">
        <div className="reason">
          <label htmlFor="reason">Optional reason (for rejection)</label>
          <input
            id="reason"
            type="text"
            placeholder="Reason to share with parent"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="buttons">
          <Button
            variant="ghost"
            onClick={() => void handleReject()}
            disabled={rejecting}
          >
            {rejecting ? "Rejecting…" : "Reject request"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void handleApprove()}
            disabled={approving}
          >
            {approving ? "Approving…" : "Approve & purge"}
          </Button>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <style jsx>{`
        .deletion-shell {
          border: 1px solid #ffb3b3;
          background: #fff0f0;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .title {
          margin: 0;
          color: #b30000;
          font-weight: 800;
        }

        .meta {
          margin: 4px 0 0;
          color: var(--color-text);
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reason {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 700;
        }

        input {
          border-radius: 10px;
          border: 1px solid var(--color-border);
          padding: 8px 10px;
        }

        input:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.35);
          outline-offset: 2px;
        }

        .buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .error {
          margin: 0;
          color: #b30000;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export default DeletionApprovalControls;


