import Card from "@/components/ui/Card";
import StatusBadge from "./StatusBadge";

type ReferralListItem = {
  id: string;
  status: string;
  packetStatus?: string | null;
  riskFlag: boolean;
  createdAt?: string | null;
  submittedAt?: string | null;
  deletionRequestedAt?: string | null;
  child: {
    name: string;
    grade?: string | null;
    schoolName?: string | null;
    district?: string | null;
  };
  user: {
    name: string;
    email: string;
  };
};

type ReferralTableProps = {
  referrals: ReferralListItem[];
  onSelect: (id: string) => void;
};

export function ReferralTable({ referrals, onSelect }: ReferralTableProps) {
  if (!referrals.length) {
    return (
      <Card padding="18px">
        <p style={{ margin: 0, color: "var(--color-muted)" }}>
          No referrals match these filters.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="0">
      <table className="table">
        <thead>
          <tr>
            <th>Child</th>
            <th>Parent</th>
            <th>School / District</th>
            <th>Status</th>
            <th>Risk</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((referral) => (
            <tr
              key={referral.id}
              onClick={() => onSelect(referral.id)}
              className="clickable"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(referral.id);
                }
              }}
              aria-label={`Open referral ${referral.id} for ${referral.child.name}`}
            >
              <td>
                <div className="cell-title">{referral.child.name}</div>
                <div className="cell-subtitle">Grade {referral.child.grade || "—"}</div>
              </td>
              <td>
                <div className="cell-title">{referral.user.name}</div>
                <div className="cell-subtitle">{referral.user.email}</div>
              </td>
              <td>
                <div className="cell-title">{referral.child.schoolName || "—"}</div>
                <div className="cell-subtitle">{referral.child.district || "—"}</div>
              </td>
              <td>
                <StatusBadge status={referral.status} />
                {referral.deletionRequestedAt ? (
                  <span className="pill warning">Deletion requested</span>
                ) : null}
              </td>
              <td>
                {referral.riskFlag ? (
                  <span className="pill danger">High risk</span>
                ) : (
                  <span className="pill muted">Normal</span>
                )}
              </td>
              <td>
                <div className="cell-title">
                  {referral.submittedAt
                    ? new Date(referral.submittedAt).toLocaleDateString()
                    : "Not submitted"}
                </div>
                <div className="cell-subtitle">
                  Created {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : "—"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 14px 16px;
          text-align: left;
        }

        thead th {
          font-size: 14px;
          color: var(--color-muted);
          border-bottom: 1px solid var(--color-border);
        }

        tbody tr + tr {
          border-top: 1px solid var(--color-border);
        }

        .clickable {
          cursor: pointer;
        }

        .clickable:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.35);
          outline-offset: -4px;
        }

        .cell-title {
          font-weight: 700;
          color: var(--color-text);
        }

        .cell-subtitle {
          font-size: 13px;
          color: var(--color-muted);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 700;
          margin-top: 6px;
          font-size: 12px;
        }

        .pill.danger {
          background: #ffe9e9;
          color: #b30000;
        }

        .pill.warning {
          background: #fff4ec;
          color: #b86800;
          margin-left: 8px;
        }

        .pill.muted {
          background: #f1f3f5;
          color: var(--color-muted);
        }

        @media (max-width: 900px) {
          th:nth-child(3),
          td:nth-child(3) {
            display: none;
          }
        }

        @media (max-width: 720px) {
          th:nth-child(5),
          td:nth-child(5),
          th:nth-child(6),
          td:nth-child(6) {
            display: none;
          }
        }
      `}</style>
    </Card>
  );
}

export default ReferralTable;


