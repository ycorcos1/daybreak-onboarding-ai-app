import { useRouter } from "next/router";
import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  ADMIN_CLINICIAN_QUERY,
  type AdminClinicianResult,
} from "@/lib/graphql/queries/adminClinicians";

export default function AdminClinicianDetailPage() {
  const router = useRouter();
  const clinicianId = router.query.id as string | undefined;

  const { data, loading, error } = useQuery<AdminClinicianResult>(ADMIN_CLINICIAN_QUERY, {
    variables: { id: clinicianId },
    skip: !clinicianId,
    fetchPolicy: "cache-and-network",
  });

  const clinician = data?.adminClinician;
  const availabilities = useMemo(() => clinician?.availabilities ?? [], [clinician?.availabilities]);
  const insurances = useMemo(() => clinician?.credentialedInsurances ?? [], [clinician?.credentialedInsurances]);

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Clinician detail"
        description="Profile, credentialed insurers, and availability slots."
      >
        <Button variant="ghost" onClick={() => router.back()} size="sm">
          ← Back
        </Button>

        <Card padding="18px">
          {loading ? (
            <p style={{ margin: 0 }}>Loading clinician…</p>
          ) : error ? (
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>Unable to load clinician.</p>
          ) : !clinician ? (
            <p style={{ margin: 0 }}>Clinician not found.</p>
          ) : (
            <div className="grid">
              <div>
                <h2>
                  {clinician.firstName} {clinician.lastName}
                </h2>
                <p className="muted">{clinician.credentials || "No credentials listed"}</p>
                <div className="meta">
                  <div>
                    <span className="label">Email</span>
                    <div>{clinician.email || "—"}</div>
                  </div>
                  <div>
                    <span className="label">Phone</span>
                    <div>{clinician.phone || "—"}</div>
                  </div>
                  <div>
                    <span className="label">License #</span>
                    <div>{clinician.licenseNumber || "—"}</div>
                  </div>
                  <div>
                    <span className="label">License state</span>
                    <div>{clinician.licenseState || "—"}</div>
                  </div>
                  <div>
                    <span className="label">Status</span>
                    <div className={`pill ${clinician.active ? "ok" : "muted-pill"}`}>
                      {clinician.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <h3>Credentialed insurances</h3>
                {insurances.length === 0 ? (
                  <p className="muted">No credentialed insurances listed.</p>
                ) : (
                  <ul className="list">
                    {insurances.map((ci) => (
                      <li key={ci.id}>
                        <div className="primary">{ci.name}</div>
                        <div className="muted">
                          {ci.state || "—"} · {ci.networkStatus || "—"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="panel">
                <h3>Availability</h3>
                {availabilities.length === 0 ? (
                  <p className="muted">No availability slots found.</p>
                ) : (
                  <div className="availability">
                    {availabilities.map((slot) => (
                      <div className="slot" key={slot.id}>
                        <div className="primary">
                          {dayLabel(slot.dayOfWeek)} · {slot.startTime}–{slot.endTime}
                        </div>
                        <div className="muted">{slot.timezone || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <style jsx>{`
          .grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }
          .muted {
            color: var(--color-muted);
            margin: 0;
          }
          .meta {
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            margin-top: 12px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            color: var(--color-muted);
            letter-spacing: 0.02em;
          }
          .panel {
            background: #fff;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            padding: 14px;
          }
          .list {
            list-style: none;
            padding: 0;
            margin: 8px 0 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
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
          .muted-pill {
            color: var(--color-muted);
          }
          .availability {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 8px;
          }
          .slot {
            border: 1px solid var(--color-border);
            border-radius: 10px;
            padding: 10px 12px;
            background: #fff;
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function dayLabel(day?: number | null) {
  if (day === null || day === undefined) return "Day";
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[day] ?? "Day";
}

