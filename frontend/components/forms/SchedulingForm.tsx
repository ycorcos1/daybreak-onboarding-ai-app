import { Fragment } from "react";
import Button from "@/components/ui/Button";
import CheckboxGroup from "@/components/forms/CheckboxGroup";
import FormSection from "@/components/forms/FormSection";
import SelectInput from "@/components/forms/SelectInput";
import TextInput from "@/components/ui/TextInput";

export type SchedulingWindow = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};

export type SuggestedWindow = {
  start_time?: string;
  end_time?: string;
  confidence_score?: number;
  source_profile?: string;
};

type ClinicianPreferences = {
  language?: string;
  gender?: string;
  lgbtqAffirming?: boolean;
  culturalNotes?: string;
  timingCategories?: string[];
};

type SchedulingFormProps = {
  timezone: string;
  locationPreference: string;
  frequency: string;
  timingCategories: string[];
  clinicianPreferences: ClinicianPreferences;
  windows: SchedulingWindow[];
  suggestedWindows: SuggestedWindow[];
  onTimezoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onFrequencyChange: (value: string) => void;
  onTimingCategoriesChange: (values: string[]) => void;
  onClinicianPreferencesChange: (prefs: ClinicianPreferences) => void;
  onAddWindow: (day: string) => void;
  onUpdateWindow: (id: string, field: "startTime" | "endTime", value: string) => void;
  onRemoveWindow: (id: string) => void;
  windowError?: string;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timezoneOptions = [
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/New_York", label: "Eastern (ET)" },
];

const timingCategoryOptions = [
  "Before school",
  "During school",
  "After school",
  "Weekends",
  "School breaks/holidays",
].map((v) => ({ value: v, label: v }));

const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every other week" },
  { value: "unsure", label: "I’m not sure yet" },
];

export default function SchedulingForm({
  timezone,
  locationPreference,
  frequency,
  timingCategories,
  clinicianPreferences,
  windows,
  suggestedWindows,
  onTimezoneChange,
  onLocationChange,
  onFrequencyChange,
  onTimingCategoriesChange,
  onClinicianPreferencesChange,
  onAddWindow,
  onUpdateWindow,
  onRemoveWindow,
  windowError,
}: SchedulingFormProps) {
  const groupedWindows = daysOfWeek.map((day) => ({
    day,
    entries: windows.filter((w) => w.day.toLowerCase() === day.toLowerCase()),
  }));

  return (
    <div className="scheduling-form">
      <FormSection
        title="When and where could sessions happen?"
        description="These times help us coordinate; they are requests, not confirmed appointments."
      >
        <div className="field-grid">
          <div className="field-col">
            <p className="db-input-label">Location preference</p>
            <div className="radio-list" role="group" aria-label="Location preference">
              {[
                { value: "home", label: "Home" },
                { value: "school", label: "School" },
                { value: "either", label: "Either home or school" },
              ].map((opt) => (
                <label key={opt.value} className="radio-item">
                  <input
                    type="radio"
                    name="locationPreference"
                    value={opt.value}
                    checked={locationPreference === opt.value}
                    onChange={(e) => onLocationChange(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-col">
            <SelectInput
              id="timezone"
              label="Time zone"
              required
              options={timezoneOptions}
              value={timezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
            />
          </div>
        </div>

        <div className="field-grid">
          <div className="field-col">
            <CheckboxGroup
              name="timingCategories"
              label="Generally, which times work?"
              options={timingCategoryOptions}
              selectedValues={timingCategories}
              helperText="You can add specific windows below."
              onChange={onTimingCategoriesChange}
            />
          </div>
          <div className="field-col">
            <SelectInput
              id="frequency"
              label="Preferred frequency"
              options={frequencyOptions}
              value={frequency}
              onChange={(e) => onFrequencyChange(e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Add detailed time windows"
        description="Add as many windows as you like. Start time must be before end time."
      >
        <div className="windows">
          {groupedWindows.map(({ day, entries }) => (
            <div key={day} className="day-row">
              <div className="day-header">
                <p className="day-label">{day}</p>
                <Button variant="ghost" size="sm" onClick={() => onAddWindow(day)}>
                  Add time window
                </Button>
              </div>
              {entries.length === 0 ? (
                <p className="muted">No windows added for {day} yet.</p>
              ) : (
                entries.map((window) => (
                  <div key={window.id} className="window-row">
                    <label className="time-field">
                      <span>Start</span>
                      <input
                        type="time"
                        value={window.startTime}
                        onChange={(e) => onUpdateWindow(window.id, "startTime", e.target.value)}
                        aria-label={`Start time for ${day}`}
                      />
                    </label>
                    <label className="time-field">
                      <span>End</span>
                      <input
                        type="time"
                        value={window.endTime}
                        onChange={(e) => onUpdateWindow(window.id, "endTime", e.target.value)}
                        aria-label={`End time for ${day}`}
                      />
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveWindow(window.id)}>
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
        {windowError ? <p className="db-input-error-text">{windowError}</p> : null}
      </FormSection>

      <FormSection title="Clinician preferences (optional)">
        <div className="field-grid">
          <div className="field-col">
            <TextInput
              id="preferred-language"
              label="Language preference"
              placeholder="e.g., Spanish, Mandarin"
              value={clinicianPreferences.language ?? ""}
              onChange={(e) =>
                onClinicianPreferencesChange({
                  ...clinicianPreferences,
                  language: e.target.value,
                })
              }
            />
          </div>
          <div className="field-col">
            <SelectInput
              id="gender-preference"
              label="Clinician gender preference"
              options={[
                { value: "none", label: "No preference" },
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
              ]}
              value={clinicianPreferences.gender ?? "none"}
              onChange={(e) =>
                onClinicianPreferencesChange({
                  ...clinicianPreferences,
                  gender: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="field-grid">
          <div className="field-col checkbox-inline">
            <label className="checkbox-inline__label">
              <input
                type="checkbox"
                checked={Boolean(clinicianPreferences.lgbtqAffirming)}
                onChange={(e) =>
                  onClinicianPreferencesChange({
                    ...clinicianPreferences,
                    lgbtqAffirming: e.target.checked,
                  })
                }
              />
              <span>LGBTQ+-affirming clinician preferred</span>
            </label>
          </div>
          <div className="field-col">
            <TextInput
              id="cultural-notes"
              label="Anything cultural we should honor?"
              placeholder="Share any cultural or community preferences"
              value={clinicianPreferences.culturalNotes ?? ""}
              onChange={(e) =>
                onClinicianPreferencesChange({
                  ...clinicianPreferences,
                  culturalNotes: e.target.value,
                })
              }
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Suggested first-session windows"
        description="These are suggestions based on your preferences and typical clinician availability."
      >
        {suggestedWindows.length ? (
          <ul className="suggested-list">
            {suggestedWindows.map((suggestion, idx) => (
              <li key={`${suggestion.start_time}-${idx}`} className="suggested-item">
                <p className="suggested-time">
                  {formatIsoTime(suggestion.start_time, timezone)} –{" "}
                  {formatIsoTime(suggestion.end_time, timezone)}
                </p>
                <p className="muted">
                  {suggestion.source_profile ? `${suggestion.source_profile} · ` : ""}
                  Confidence: {formatConfidence(suggestion.confidence_score)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No suggested windows yet. Adjust your times or try a different day to see suggestions.
          </p>
        )}
      </FormSection>

      <style jsx>{`
        .scheduling-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
          align-items: flex-end;
        }

        .field-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .windows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .day-row {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px;
          background: #fff;
        }

        .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .day-label {
          margin: 0;
          font-weight: 700;
          color: var(--color-deep-aqua);
        }

        .window-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          align-items: center;
          margin-top: 8px;
        }

        .time-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-weight: 600;
          color: var(--color-deep-aqua);
        }

        .time-field input[type="time"] {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 14px;
        }

        .muted {
          color: var(--color-muted);
          margin: 4px 0 0;
        }

        .checkbox-inline {
          margin-top: 4px;
        }

        .checkbox-inline__label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .suggested-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .suggested-item {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 12px;
          background: #fff;
        }

        .suggested-time {
          margin: 0 0 6px;
          font-weight: 700;
          color: var(--color-deep-aqua);
        }

        @media (max-width: 768px) {
          .window-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function formatIsoTime(value?: string, timeZone?: string) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

function formatConfidence(score?: number) {
  if (typeof score !== "number") return "N/A";
  return `${Math.min(100, Math.max(0, Math.round(score)))}%`;
}

