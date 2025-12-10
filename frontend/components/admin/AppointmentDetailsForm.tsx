import { useState } from "react";
import { useMutation } from "@apollo/client";
import Button from "@/components/ui/Button";
import { ADMIN_RECORD_APPOINTMENT } from "@/lib/graphql/mutations/adminReferrals";

type AppointmentDetailsFormProps = {
  referralId: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  clinicianName?: string | null;
  sessionType?: string | null;
  onSaved: () => void;
};

export function AppointmentDetailsForm({
  referralId,
  scheduledDate,
  scheduledTime,
  clinicianName,
  sessionType,
  onSaved,
}: AppointmentDetailsFormProps) {
  const [date, setDate] = useState(scheduledDate || "");
  const [time, setTime] = useState(scheduledTime || "");
  const [clinician, setClinician] = useState(clinicianName || "");
  const [type, setType] = useState(sessionType || "telehealth");
  const [error, setError] = useState<string | null>(null);
  const [recordAppointment, { loading }] = useMutation(ADMIN_RECORD_APPOINTMENT);

  const handleSave = async () => {
    setError(null);
    if (!date || !time || !clinician || !type) {
      setError("All appointment details are required.");
      return;
    }

    try {
      const { data } = await recordAppointment({
        variables: {
          referralId,
          scheduledDate: date,
          scheduledTime: time,
          clinicianName: clinician,
          sessionType: type,
        },
      });
      const result = data?.recordAppointmentDetails;
      if (result?.errors?.length) {
        setError(result.errors.join(", "));
        return;
      }
      onSaved();
    } catch (e) {
      setError("Unable to save appointment details right now.");
    }
  };

  return (
    <div className="appointment-card">
      <div className="fields">
        <div className="field">
          <label htmlFor="scheduled-date">Scheduled date</label>
          <input
            id="scheduled-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="scheduled-time">Time</label>
          <input
            id="scheduled-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="clinician-name">Clinician</label>
          <input
            id="clinician-name"
            type="text"
            value={clinician}
            onChange={(e) => setClinician(e.target.value)}
            placeholder="Name"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="session-type">Session type</label>
          <select
            id="session-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="telehealth">Telehealth</option>
            <option value="in_person">In-person</option>
          </select>
        </div>
      </div>
      <Button onClick={() => void handleSave()} disabled={loading}>
        {loading ? "Saving…" : "Save appointment details"}
      </Button>
      {error ? <p className="error">{error}</p> : null}

      <style jsx>{`
        .appointment-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fields {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 700;
          color: var(--color-text);
        }

        input,
        select {
          border-radius: 12px;
          border: 1px solid var(--color-border);
          padding: 10px 12px;
          font-weight: 600;
        }

        input:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.35);
          outline-offset: 2px;
        }

        .error {
          color: #b30000;
          margin: 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default AppointmentDetailsForm;


