import { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type ReviewSummaryProps = {
  referral: any;
  missingSections?: string[];
  onEditStep: (step: string) => void;
  showEdit?: boolean;
};

const consentLabels: Record<string, string> = {
  terms_of_use: "Terms of Use",
  privacy_policy: "Privacy Policy",
  non_emergency_acknowledgment: "Not an emergency service",
  telehealth_consent: "Telehealth consent",
  guardian_authorization: "Legal guardian authorization",
};

const requiredConsentTypes = Object.keys(consentLabels);

export default function ReviewSummary({
  referral,
  missingSections = [],
  onEditStep,
  showEdit = true,
}: ReviewSummaryProps) {
  const missingSet = new Set(missingSections);
  const intake = (referral.intakeResponse?.responses as Record<string, any>) || {};
  const screener = (referral.aiScreenerSession?.summaryJsonb as Record<string, any>) || null;
  const scheduling = referral.schedulingPreference;
  const windows = (scheduling?.windows as Array<Record<string, string>>) || [];
  const suggestedWindows = (scheduling?.suggestedWindows as Array<Record<string, any>>) || [];
  const consents = referral.consentRecords || [];
  const consentTypesLower = consents.map((c: any) => (c.consentType || "").toLowerCase());
  const hasAllConsents = requiredConsentTypes.every((type) => consentTypesLower.includes(type));

  return (
    <div className="review-summary">
      <SummarySection
        title="Parent information"
        missing={missingSet.has("Parent info")}
        onEdit={() => onEditStep("parent-info")}
        showEdit={showEdit}
      >
        <TwoCol>
          <Info label="Name" value={referral.user?.name} />
          <Info label="Relationship" value={referral.user?.relationshipToChild} />
          <Info label="Email" value={referral.user?.email} />
          <Info label="Phone" value={referral.user?.phone} />
          <Info label="Address" value={referral.user?.address} />
          <Info label="Language preference" value={referral.user?.languagePreference} />
        </TwoCol>
      </SummarySection>

      <SummarySection
        title="Child information"
        missing={missingSet.has("Child info")}
        onEdit={() => onEditStep("child-info")}
        showEdit={showEdit}
      >
        <TwoCol>
          <Info label="Name" value={referral.child?.name} />
          <Info label="DOB / Age band" value={referral.child?.dob || referral.child?.ageBand} />
          <Info label="Grade" value={referral.child?.grade} />
          <Info label="School" value={referral.child?.schoolName} />
          <Info label="District" value={referral.child?.district} />
          <Info label="State" value={referral.child?.state} />
          <Info label="Pronouns" value={referral.child?.pronouns} />
          <Info label="Primary language" value={referral.child?.primaryLanguage} />
        </TwoCol>
      </SummarySection>

      <SummarySection
        title="AI screener summary"
        missing={missingSet.has("Clinical intake or screener")}
        onEdit={() => onEditStep("screener")}
        showEdit={showEdit}
      >
        {screener ? (
          <ul className="plain-list">
            {Object.entries(screener).map(([key, value]) => (
              <li key={key}>
                <strong>{humanize(key)}:</strong> {renderValue(value)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No screener summary yet.</p>
        )}
      </SummarySection>

      <SummarySection
        title="Clinical intake"
        missing={missingSet.has("Clinical intake or screener")}
        onEdit={() => onEditStep("intake")}
        showEdit={showEdit}
      >
        {Object.keys(intake).length ? (
          <ul className="plain-list">
            {intake.primary_concerns ? (
              <li>
                <strong>Primary concerns:</strong> {renderValue(intake.primary_concerns)}
              </li>
            ) : null}
            {intake.description ? (
              <li>
                <strong>Description:</strong> {renderValue(intake.description)}
              </li>
            ) : null}
            {intake.duration ? (
              <li>
                <strong>Duration:</strong> {renderValue(intake.duration)}
              </li>
            ) : null}
            {intake.impacts ? (
              <li>
                <strong>Impacts:</strong> {renderValue(intake.impacts)}
              </li>
            ) : null}
            {intake.current_supports ? (
              <li>
                <strong>Supports:</strong> {renderValue(intake.current_supports)}
              </li>
            ) : null}
            {intake.safety_concerns ? (
              <li>
                <strong>Safety:</strong> {renderValue(intake.safety_concerns)}
              </li>
            ) : null}
            {intake.parent_goals ? (
              <li>
                <strong>Goals:</strong> {renderValue(intake.parent_goals)}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="muted">No intake responses yet.</p>
        )}
      </SummarySection>

      <SummarySection
        title="Insurance & cost"
        missing={missingSet.has("Insurance")}
        onEdit={() => onEditStep("insurance")}
        showEdit={showEdit}
      >
        <TwoCol>
          <Info label="Insurance status" value={referral.insuranceDetail?.insuranceStatus} />
          <Info label="Insurer" value={referral.insuranceDetail?.insurerName} />
          <Info label="Plan name" value={referral.insuranceDetail?.planName} />
          <Info label="Member ID" value={referral.insuranceDetail?.memberId} />
          <Info label="Policyholder" value={referral.insuranceDetail?.policyholderName} />
          <Info label="Cost estimate" value={formatCostEstimate(referral.costEstimate)} />
        </TwoCol>
      </SummarySection>

      <SummarySection
        title="Scheduling preferences"
        missing={missingSet.has("Scheduling")}
        onEdit={() => onEditStep("scheduling")}
        showEdit={showEdit}
      >
        {scheduling ? (
          <div className="scheduling-summary">
            <TwoCol>
              <Info label="Location preference" value={scheduling.locationPreference} />
              <Info label="Time zone" value={scheduling.timezone} />
              <Info label="Frequency" value={scheduling.frequency} />
            </TwoCol>
            <div className="windows">
              <p className="subhead">Your windows</p>
              {windows.length === 0 ? (
                <p className="muted">No windows added.</p>
              ) : (
                <ul className="plain-list">
                  {windows.map((w, idx) => (
                    <li key={`${w.day}-${idx}`}>
                      <strong>{capitalize(w.day)}:</strong>{" "}
                      {formatIsoWindow(w.start_time || w.startTime, w.end_time || w.endTime, scheduling?.timezone)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {suggestedWindows.length ? (
              <div className="windows">
                <p className="subhead">Suggested first-session windows</p>
                <ul className="plain-list">
                  {suggestedWindows.map((w, idx) => (
                    <li key={`${w.start_time}-${idx}`}>
                      {formatIsoWindow(w.start_time, w.end_time, scheduling?.timezone)}{" "}
                      {w.source_profile ? `· ${w.source_profile}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="muted">No scheduling preferences saved yet.</p>
        )}
      </SummarySection>

      <SummarySection
        title="Consents"
        missing={missingSet.has("Consents")}
        onEdit={() => onEditStep("consent")}
        showEdit={showEdit}
      >
        <ul className="plain-list">
          {requiredConsentTypes.map((type) => {
            const record = consents.find(
              (c: any) => (c.consentType || "").toLowerCase() === type,
            );
            return (
              <li key={type} className={record ? "" : "muted"}>
                <strong>{consentLabels[type]}:</strong>{" "}
                {record ? `Accepted on ${formatDate(record.acceptedAt)}` : "Not accepted"}
              </li>
            );
          })}
        </ul>
        {!hasAllConsents ? (
          <p className="db-input-error-text">All required consents must be accepted.</p>
        ) : null}
      </SummarySection>

      <style jsx>{`
        .review-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .plain-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 6px;
        }

        .muted {
          color: var(--color-muted);
        }

        .windows {
          margin-top: 8px;
        }

        .subhead {
          margin: 0 0 6px;
          font-weight: 700;
          color: var(--color-deep-aqua);
        }
      `}</style>
    </div>
  );
}

type SummarySectionProps = {
  title: string;
  onEdit: () => void;
  missing?: boolean;
  children: ReactNode;
  showEdit?: boolean;
};

function SummarySection({ title, onEdit, missing = false, children, showEdit = true }: SummarySectionProps) {
  return (
    <Card padding="16px" className={`summary-card ${missing ? "summary-card--warning" : ""}`}>
      <div className="summary-card__header">
        <div>
          <p className="summary-eyebrow">{missing ? "Needs attention" : "Ready"}</p>
          <h3>{title}</h3>
        </div>
        {showEdit ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
      </div>
      <div className="summary-card__body">{children}</div>
      <style jsx>{`
        .summary-card {
          border: 1px solid var(--color-border);
          border-radius: 14px;
          background: #fff;
        }

        .summary-card--warning {
          border-color: var(--color-secondary-gold);
          background: #fff9f1;
        }

        .summary-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .summary-eyebrow {
          margin: 0;
          color: var(--color-muted);
          font-weight: 700;
          font-size: 13px;
        }

        h3 {
          margin: 4px 0 8px;
          color: var(--color-deep-aqua);
        }
      `}</style>
    </Card>
  );
}

function TwoCol({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="two-col">{children}</div>
      <style jsx>{`
        .two-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
      `}</style>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="info-item">
      <p className="info-label">{label}</p>
      <p className="info-value">{value || "Not provided"}</p>
      <style jsx>{`
        .info-label {
          margin: 0;
          font-size: 13px;
          color: var(--color-muted);
        }
        .info-value {
          margin: 2px 0 0;
          font-weight: 600;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

function renderValue(value: any) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 0);
  if (value === true) return "Yes";
  if (value === false) return "No";
  return value ?? "Not provided";
}

function humanize(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(str?: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatIsoWindow(start?: string, end?: string, timeZone?: string) {
  if (!start || !end) return "Time not available";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} – ${end}`;
  }
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCostEstimate(costEstimate?: any) {
  if (!costEstimate) return "Not calculated yet";
  if (!costEstimate.category) return "Not calculated yet";
  return `${humanize(costEstimate.category)}${costEstimate.explanationText ? ` — ${costEstimate.explanationText}` : ""}`;
}

