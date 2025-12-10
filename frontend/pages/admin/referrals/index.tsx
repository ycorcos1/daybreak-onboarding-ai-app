import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ReferralTable from "@/components/admin/ReferralTable";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ADMIN_REFERRALS_QUERY } from "@/lib/graphql/queries/adminReferrals";

type StatusFilter = "submitted" | "in_review" | "ready_to_schedule" | "scheduled" | "closed" | "withdrawn" | "draft";

export default function AdminReferralsPage() {
  const router = useRouter();
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>(["submitted", "in_review"]);
  const [riskOnly, setRiskOnly] = useState(false);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const variables = useMemo(() => {
    const filter: Record<string, unknown> = {};
    if (statusFilters.length) {
      filter.status = statusFilters.map((s) => s.toUpperCase());
    }
    if (riskOnly) {
      filter.riskFlag = true;
    }
    if (createdFrom) filter.createdFrom = createdFrom;
    if (createdTo) filter.createdTo = createdTo;

    return { filter, limit: 100, offset: 0 };
  }, [createdFrom, createdTo, riskOnly, statusFilters]);

  const { data, loading, refetch } = useQuery(ADMIN_REFERRALS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const toggleStatus = (status: StatusFilter) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Referrals"
        description="Triage referrals, update statuses, and review packets."
      >
        <Card>
          <div className="filters">
            <div className="filter-group">
              <p className="label">Statuses</p>
              <div className="chips">
                {(
                  ["draft", "submitted", "in_review", "ready_to_schedule", "scheduled", "closed", "withdrawn"] as StatusFilter[]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`chip ${statusFilters.includes(status) ? "active" : ""}`}
                    onClick={() => toggleStatus(status)}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="label" htmlFor="risk-only">
                <input
                  id="risk-only"
                  type="checkbox"
                  checked={riskOnly}
                  onChange={(e) => setRiskOnly(e.target.checked)}
                />
                High-risk only
              </label>
            </div>
            <div className="filter-group dates">
              <div>
                <label className="label" htmlFor="from">
                  Created from
                </label>
                <input
                  id="from"
                  type="date"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="to">
                  Created to
                </label>
                <input
                  id="to"
                  type="date"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-actions">
              <Button size="sm" variant="ghost" onClick={() => void refetch()}>
                Refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStatusFilters([]);
                  setRiskOnly(false);
                  setCreatedFrom("");
                  setCreatedTo("");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card padding="18px">
            <p style={{ margin: 0 }}>Loading referrals…</p>
          </Card>
        ) : (
          <ReferralTable
            referrals={data?.adminReferrals ?? []}
            onSelect={(id) => {
              void router.push(`/admin/referrals/${id}`);
            }}
          />
        )}

        <style jsx>{`
          .filters {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .filter-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .label {
            font-weight: 700;
            margin: 0;
            color: var(--color-text);
          }

          .chips {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .chip {
            border-radius: 999px;
            border: 1px solid var(--color-border);
            padding: 6px 10px;
            background: #fff;
            cursor: pointer;
            font-weight: 700;
            text-transform: capitalize;
          }

          .chip.active {
            background: rgba(0, 150, 168, 0.12);
            border-color: var(--color-primary-teal);
            color: var(--color-primary-teal);
          }

          .filter-group input[type="checkbox"] {
            margin-right: 8px;
            accent-color: var(--color-primary-teal);
          }

          .dates {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
          }

          input[type="date"] {
            border-radius: 10px;
            border: 1px solid var(--color-border);
            padding: 8px 10px;
          }

          input[type="date"]:focus-visible {
            outline: 2px solid rgba(0, 150, 168, 0.35);
            outline-offset: 2px;
          }

          .filter-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}


