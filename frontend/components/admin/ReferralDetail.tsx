import { useState } from "react";
import { useMutation } from "@apollo/client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "./StatusBadge";
import StatusUpdateControls from "./StatusUpdateControls";
import AppointmentDetailsForm from "./AppointmentDetailsForm";
import DeletionApprovalControls from "./DeletionApprovalControls";
import { ADMIN_ADD_REFERRAL_NOTE } from "@/lib/graphql/mutations/adminReferrals";

type ReferralDetailProps = {
  referral: any;
  onRefresh: () => void;
};

export function ReferralDetail({ referral, onRefresh }: ReferralDetailProps) {
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [addNote, { loading: addingNote }] = useMutation(ADMIN_ADD_REFERRAL_NOTE, {
    refetchQueries: ["AdminReferral"],
  });

  const handleAddNote = async () => {
    setNoteError(null);
    if (!noteText.trim()) {
      setNoteError("Note cannot be empty.");
      return;
    }
    try {
      const { data } = await addNote({
        variables: { referralId: referral.id, noteText },
      });
      const result = data?.addReferralNote;
      if (result?.errors?.length) {
        setNoteError(result.errors.join(", "));
        return;
      }
      setNoteText("");
      onRefresh();
    } catch (e) {
      setNoteError("Unable to add note right now.");
    }
  };

  const downloadPdf = () => {
    const url = referral?.referralPacket?.pdfUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="detail-grid">
      <Card>
        <div className="header-row">
          <div>
            <p className="eyebrow">Referral #{referral.id}</p>
            <h2>{referral.child?.name}</h2>
            <p className="muted">
              {referral.child?.schoolName} · {referral.child?.district}
            </p>
          </div>
          <div className="badges">
            <StatusBadge status={referral.status} />
            {referral.riskFlag ? <span className="pill danger">High risk</span> : null}
            {referral.deletionRequestedAt ? (
              <span className="pill warning">Deletion requested</span>
            ) : null}
          </div>
        </div>
        <div className="actions">
          <StatusUpdateControls
            referralId={referral.id}
            currentStatus={referral.status}
            onUpdated={onRefresh}
          />
          {referral.status === "scheduled" ? (
            <AppointmentDetailsForm
              referralId={referral.id}
              scheduledDate={referral.scheduledDate}
              scheduledTime={referral.scheduledTime}
              clinicianName={referral.clinicianName}
              sessionType={referral.sessionType}
              onSaved={onRefresh}
            />
          ) : null}
          {referral.deletionRequestedAt ? (
            <DeletionApprovalControls
              referralId={referral.id}
              deletionRequestedAt={referral.deletionRequestedAt}
              onCompleted={onRefresh}
            />
          ) : null}
          <div className="packet-row">
            <div>
              <p className="label">Packet status</p>
              <p className="muted">{referral.packetStatus || "not_generated"}</p>
            </div>
            <Button
              variant="secondary"
              onClick={downloadPdf}
              disabled={!referral?.referralPacket?.pdfUrl}
            >
              View packet PDF
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3>Parent & Child</h3>
        <div className="two-col">
          <div>
            <p className="label">Parent</p>
            <p className="value">{referral.user?.name}</p>
            <p className="muted">{referral.user?.email}</p>
            <p className="muted">{referral.user?.phone}</p>
          </div>
          <div>
            <p className="label">Child</p>
            <p className="value">{referral.child?.name}</p>
            <p className="muted">
              Grade {referral.child?.grade || "—"} · {referral.child?.schoolName}
            </p>
            <p className="muted">{referral.child?.district}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3>Screener summary</h3>
        {referral.aiScreenerSession?.summaryJsonb ? (
          <pre className="json-block">
            {JSON.stringify(referral.aiScreenerSession.summaryJsonb, null, 2)}
          </pre>
        ) : (
          <p className="muted">No screener summary available.</p>
        )}
      </Card>

      <Card>
        <h3>Clinical intake</h3>
        {referral.intakeResponse?.responses ? (
          <pre className="json-block">
            {JSON.stringify(referral.intakeResponse.responses, null, 2)}
          </pre>
        ) : (
          <p className="muted">No intake responses captured.</p>
        )}
      </Card>

      <Card>
        <h3>Insurance & Cost</h3>
        <div className="two-col">
          <div>
            <p className="label">Insurance status</p>
            <p className="value">
              {referral.insuranceDetail?.insuranceStatus || "Not provided"}
            </p>
            <p className="muted">
              {referral.insuranceDetail?.insurerName} {referral.insuranceDetail?.planName}
            </p>
            <p className="muted">
              Member #{referral.insuranceDetail?.memberId || "—"} · Group #
              {referral.insuranceDetail?.groupId || "—"}
            </p>
          </div>
          <div>
            <p className="label">Cost estimate</p>
            <p className="value">{referral.costEstimate?.category || "TBD"}</p>
            <p className="muted">{referral.costEstimate?.explanationText}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3>Scheduling preferences</h3>
        <p className="muted">
          Timezone: {referral.schedulingPreference?.timezone || "—"} · Location:{" "}
          {referral.schedulingPreference?.locationPreference || "—"}
        </p>
        <div className="windows">
          {(referral.schedulingPreference?.windows || []).map((window: any, idx: number) => (
            <span key={`${window.day}-${idx}`} className="pill muted">
              {window.day}: {window.start_time} – {window.end_time}
            </span>
          ))}
        </div>
        {referral.schedulingPreference?.suggestedWindows?.length ? (
          <div className="suggested">
            <p className="label">Suggested first sessions</p>
            <div className="windows">
              {referral.schedulingPreference.suggestedWindows.map(
                (window: any, idx: number) => (
                  <span key={`${window.day}-${idx}`} className="pill">
                    {window.day || window.date}: {window.start_time} – {window.end_time}
                  </span>
                ),
              )}
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <h3>Consents</h3>
        <div className="consents">
          {referral.consentRecords?.length ? (
            referral.consentRecords.map((consent: any) => (
              <div key={consent.id} className="consent-row">
                <span className="pill muted">{consent.consentType}</span>
                <span className="muted">
                  {consent.acceptedAt
                    ? new Date(consent.acceptedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No consents captured.</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="notes-header">
          <h3>Internal notes</h3>
          <div className="note-form">
            <input
              type="text"
              placeholder="Add a note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddNote();
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void handleAddNote()}
              disabled={addingNote}
            >
              Add
            </Button>
          </div>
        </div>
        {noteError ? <p className="error">{noteError}</p> : null}
        <div className="notes-list">
          {referral.referralNotes?.length ? (
            referral.referralNotes.map((note: any) => (
              <div key={note.id} className="note">
                <p className="value">{note.noteText}</p>
                <p className="muted">
                  {note.adminUser?.name} · {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="muted">No notes yet.</p>
          )}
        </div>
      </Card>

      <style jsx>{`
        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        h2 {
          margin: 0 0 4px;
          color: var(--color-deep-aqua);
        }

        .muted {
          color: var(--color-muted);
          margin: 0;
        }

        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .two-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .label {
          margin: 0 0 4px;
          font-weight: 700;
          color: var(--color-text);
        }

        .value {
          margin: 0;
          font-weight: 700;
          color: var(--color-text);
        }

        .json-block {
          background: #f8fafc;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px;
          overflow: auto;
          font-size: 13px;
        }

        .windows {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .suggested {
          margin-top: 10px;
        }

        .consents {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .consent-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .note-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .note-form input {
          border-radius: 10px;
          border: 1px solid var(--color-border);
          padding: 8px 10px;
          min-width: 220px;
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .note {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: #fff;
        }

        .packet-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          background: #f1f3f5;
        }

        .pill.danger {
          background: #ffe9e9;
          color: #b30000;
        }

        .pill.warning {
          background: #fff4ec;
          color: #b86800;
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

export default ReferralDetail;


