import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import {
  ADMIN_CREDENTIALED_INSURANCES_QUERY,
  ADMIN_INSURANCE_COVERAGES_QUERY,
  type AdminCredentialedInsurancesResult,
  type AdminInsuranceCoveragesResult,
} from "@/lib/graphql/queries/adminInsurances";

export default function AdminInsurancePage() {
  const { data: credData, loading: loadingCred, error: credError } =
    useQuery<AdminCredentialedInsurancesResult>(ADMIN_CREDENTIALED_INSURANCES_QUERY, {
      fetchPolicy: "cache-and-network",
    });

  const { data: covData, loading: loadingCov, error: covError } =
    useQuery<AdminInsuranceCoveragesResult>(ADMIN_INSURANCE_COVERAGES_QUERY, {
      fetchPolicy: "cache-and-network",
    });

  const credentialed = credData?.adminCredentialedInsurances ?? [];
  const coverages = covData?.adminInsuranceCoverages ?? [];

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Insurance"
        description="Credentialed insurers and any recorded coverages from sample data."
      >
        <Card padding="18px">
          <h3>Credentialed insurances</h3>
          {loadingCred ? (
            <p style={{ margin: 0 }}>Loading credentialed insurances…</p>
          ) : credError ? (
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>
              Unable to load credentialed insurances.
            </p>
          ) : credentialed.length === 0 ? (
            <p style={{ margin: 0 }}>No credentialed insurances found.</p>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Name</div>
                <div>State</div>
                <div>Line of business</div>
                <div>Network status</div>
              </div>
              <div className="tbody">
                {credentialed.map((ins) => (
                  <div className="row" key={ins.id}>
                    <div className="cell">{ins.name}</div>
                    <div className="cell">{ins.state || "—"}</div>
                    <div className="cell">{ins.lineOfBusiness || "—"}</div>
                    <div className="cell">{ins.networkStatus || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card padding="18px">
          <h3>Insurance coverages</h3>
          <p className="muted">
            Sample data skipped user-bound coverages, so this list may be empty.
          </p>
          {loadingCov ? (
            <p style={{ margin: 0 }}>Loading coverages…</p>
          ) : covError ? (
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>
              Unable to load coverages.
            </p>
          ) : coverages.length === 0 ? (
            <p style={{ margin: 0 }}>No insurance coverages found.</p>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Member</div>
                <div>Plan</div>
                <div>Insurer</div>
                <div>Status</div>
              </div>
              <div className="tbody">
                {coverages.map((cov) => (
                  <div className="row" key={cov.id}>
                    <div className="cell">
                      <div className="primary">{cov.user.name || "—"}</div>
                      <div className="muted">{cov.user.email || cov.user.id}</div>
                    </div>
                    <div className="cell">
                      <div className="primary">{cov.planName || cov.policyHolderName || "—"}</div>
                      <div className="muted">{cov.memberId || "—"}</div>
                    </div>
                    <div className="cell">{cov.credentialedInsurance?.name || cov.insuranceCompanyName || "—"}</div>
                    <div className="cell">
                      {cov.inNetwork ? (
                        <span className="pill ok">In network</span>
                      ) : cov.outOfNetwork ? (
                        <span className="pill warn">Out of network</span>
                      ) : (
                        <span className="pill muted-pill">Unknown</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <style jsx>{`
          .muted {
            color: var(--color-muted);
          }
          .table {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .thead,
          .row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
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
          .pill.warn {
            color: #d97706;
            border-color: rgba(217, 119, 6, 0.35);
            background: rgba(217, 119, 6, 0.08);
          }
          .muted-pill {
            color: var(--color-muted);
          }
          @media (max-width: 900px) {
            .thead {
              display: none;
            }
            .row {
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

