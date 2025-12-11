import { useMemo } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  ADMIN_CLINICIANS_QUERY,
  type AdminCliniciansResult,
} from "@/lib/graphql/queries/adminClinicians";

export default function AdminCliniciansPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<AdminCliniciansResult>(ADMIN_CLINICIANS_QUERY, {
    variables: { limit: 200, offset: 0 },
    fetchPolicy: "cache-and-network",
  });

  const clinicians = useMemo(() => data?.adminClinicians ?? [], [data?.adminClinicians]);

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Clinicians"
        description="Browse clinician roster with credentialed insurers and availability."
      >
        <Card padding="18px">
          {loading ? (
            <p style={{ margin: 0 }}>Loading clinicians…</p>
          ) : error ? (
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>
              Unable to load clinicians.
            </p>
          ) : clinicians.length === 0 ? (
            <p style={{ margin: 0 }}>No clinicians found.</p>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Name</div>
                <div>License</div>
                <div>Insurances</div>
                <div>Availabilities</div>
                <div>Status</div>
                <div />
              </div>
              <div className="tbody">
                {clinicians.map((clinician) => (
                  <div className="row" key={clinician.id}>
                    <div className="cell">
                      <div className="primary">
                        {clinician.firstName} {clinician.lastName}
                      </div>
                      <div className="muted">{clinician.credentials || "—"}</div>
                    </div>
                    <div className="cell">
                      <div className="primary">{clinician.licenseNumber || "—"}</div>
                      <div className="muted">{clinician.licenseState || "—"}</div>
                    </div>
                    <div className="cell">{clinician.credentialedInsurances?.length ?? 0}</div>
                    <div className="cell">{clinician.availabilities?.length ?? 0}</div>
                    <div className="cell">
                      <span className={`pill ${clinician.active ? "ok" : "muted-pill"}`}>
                        {clinician.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="cell action">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void router.push(`/admin/clinicians/${clinician.id}`)}
                      >
                        View
                      </Button>
                    </div>
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
            grid-template-columns: 2fr 1.4fr 1fr 1fr 1fr 0.8fr;
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
          .pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-weight: 700;
            border: 1px solid var(--color-border);
            background: #fff;
          }
          .pill.ok {
            color: var(--color-primary-teal);
            border-color: rgba(0, 150, 168, 0.35);
            background: rgba(0, 150, 168, 0.08);
          }
          .muted-pill {
            color: var(--color-muted);
          }
          .action {
            align-items: flex-end;
            justify-content: center;
          }
          @media (max-width: 1000px) {
            .thead {
              display: none;
            }
            .row {
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            .action {
              align-items: flex-start;
            }
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

