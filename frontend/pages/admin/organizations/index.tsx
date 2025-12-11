import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import {
  ADMIN_ORGANIZATIONS_QUERY,
  type AdminOrganizationsResult,
} from "@/lib/graphql/queries/adminOrganizations";

const KIND_LABEL: Record<number, string> = {
  0: "District",
  1: "School",
};

export default function AdminOrganizationsPage() {
  const { data, loading, error } = useQuery<AdminOrganizationsResult>(ADMIN_ORGANIZATIONS_QUERY, {
    variables: { limit: 500 },
    fetchPolicy: "cache-and-network",
  });

  const orgs = useMemo(() => data?.adminOrganizations ?? [], [data?.adminOrganizations]);

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Organizations"
        description="View districts, schools, and their contracts from sample data."
      >
        <Card padding="18px">
          {loading ? (
            <p style={{ margin: 0 }}>Loading organizations…</p>
          ) : error ? (
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>
              Unable to load organizations.
            </p>
          ) : orgs.length === 0 ? (
            <p style={{ margin: 0 }}>No organizations found.</p>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Name</div>
                <div>Type</div>
                <div>Parent</div>
                <div>Contracts</div>
              </div>
              <div className="tbody">
                {orgs.map((org) => (
                  <div className="row" key={org.id}>
                    <div className="cell">
                      <div className="primary">{org.name || "—"}</div>
                      <div className="muted">{org.slug || "No slug"}</div>
                    </div>
                    <div className="cell">{org.kind !== undefined && org.kind !== null ? KIND_LABEL[org.kind] || "Other" : "—"}</div>
                    <div className="cell">{org.parentOrganization?.name || "—"}</div>
                    <div className="cell">{org.contracts?.length ?? 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <style jsx>{`
          .table {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .thead,
          .row {
            display: grid;
            grid-template-columns: 2fr 1fr 1.5fr 0.8fr;
            gap: 12px;
            align-items: center;
          }
          .thead {
            font-weight: 700;
            color: var(--color-muted);
            text-transform: uppercase;
            letter-spacing: 0.02em;
            font-size: 12px;
          }
          .tbody {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .row {
            background: #fff;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            padding: 12px 14px;
          }
          .cell {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .primary {
            font-weight: 700;
          }
          .muted {
            color: var(--color-muted);
            font-size: 12px;
          }
          @media (max-width: 900px) {
            .thead {
              display: none;
            }
            .row {
              grid-template-columns: 1fr 1fr;
            }
            .row .cell:nth-child(3),
            .row .cell:nth-child(4) {
              grid-column: span 2;
            }
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

