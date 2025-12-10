import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import Button from "@/components/ui/Button";
import { ADMIN_UPDATE_REFERRAL_STATUS } from "@/lib/graphql/mutations/adminReferrals";
import StatusBadge from "./StatusBadge";

const TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["in_review", "withdrawn"],
  in_review: ["ready_to_schedule", "submitted", "withdrawn"],
  ready_to_schedule: ["scheduled", "in_review", "withdrawn"],
  scheduled: ["closed", "withdrawn"],
  closed: ["withdrawn"],
  withdrawn: [],
  deleted: [],
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  ready_to_schedule: "Ready to Schedule",
  scheduled: "Scheduled",
  closed: "Closed",
  withdrawn: "Withdrawn",
};

type StatusUpdateControlsProps = {
  referralId: string;
  currentStatus: string;
  onUpdated: () => void;
};

export function StatusUpdateControls({
  referralId,
  currentStatus,
  onUpdated,
}: StatusUpdateControlsProps) {
  const normalizedStatus = currentStatus?.toLowerCase?.() || "draft";
  const [nextStatus, setNextStatus] = useState(TRANSITIONS[normalizedStatus]?.[0] || "");
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, { loading }] = useMutation(ADMIN_UPDATE_REFERRAL_STATUS);

  const options = TRANSITIONS[normalizedStatus] || [];

  useEffect(() => {
    setNextStatus(TRANSITIONS[normalizedStatus]?.[0] || "");
  }, [normalizedStatus]);

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setError(null);
    try {
      const { data } = await updateStatus({
        variables: { referralId, status: nextStatus.toUpperCase() },
      });
      const result = data?.updateReferralStatus;
      if (result?.errors?.length) {
        setError(result.errors.join(", "));
        return;
      }
      onUpdated();
    } catch (e) {
      setError("Unable to update status right now.");
    }
  };

  if (!options.length) {
    return (
      <div className="status-shell">
        <div>
          <p className="label">Status</p>
          <StatusBadge status={currentStatus} />
        </div>
        <p className="muted small">No further transitions available.</p>
      </div>
    );
  }

  return (
    <div className="status-shell">
      <div className="status-row">
        <div>
          <p className="label">Current status</p>
          <StatusBadge status={currentStatus} />
        </div>
        <div className="next">
          <label htmlFor="next-status" className="label">
            Next status
          </label>
          <select
            id="next-status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
          >
            {options.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status] || status}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => void handleUpdate()} disabled={loading}>
          {loading ? "Updating…" : "Update status"}
        </Button>
      </div>
      {error ? <div className="error">{error}</div> : null}

      <style jsx>{`
        .status-shell {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .status-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          align-items: end;
        }

        .label {
          margin: 0 0 4px;
          font-weight: 700;
          color: var(--color-text);
        }

        .next select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          padding: 10px 12px;
          font-weight: 600;
        }

        .next select:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.35);
          outline-offset: 2px;
        }

        .muted {
          color: var(--color-muted);
        }

        .small {
          margin: 0;
        }

        .error {
          background: #ffe9e9;
          color: #b30000;
          border-radius: 10px;
          padding: 8px 10px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default StatusUpdateControls;


