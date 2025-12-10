import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import ValidationError from "@/components/forms/ValidationError";
import SchedulingForm, {
  SchedulingWindow,
  SuggestedWindow,
} from "@/components/forms/SchedulingForm";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep } from "@/lib/onboardingSteps";
import { UPDATE_SCHEDULING_PREFERENCES } from "@/lib/graphql/mutations/referrals.graphql";

const DEFAULT_TIMEZONE =
  typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "America/Los_Angeles";

const requiredFieldsMessage = "Please add at least one valid scheduling window to continue.";

export default function SchedulingStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error } = useReferral(referralId);
  const [updateSchedulingPreferences] = useMutation(UPDATE_SCHEDULING_PREFERENCES);

  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [locationPreference, setLocationPreference] = useState("either");
  const [frequency, setFrequency] = useState("unsure");
  const [timingCategories, setTimingCategories] = useState<string[]>([]);
  const [clinicianPreferences, setClinicianPreferences] = useState({
    language: "",
    gender: "none",
    lgbtqAffirming: false,
    culturalNotes: "",
  });
  const [windows, setWindows] = useState<SchedulingWindow[]>([]);
  const [suggestedWindows, setSuggestedWindows] = useState<SuggestedWindow[]>([]);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState("");
  const [windowError, setWindowError] = useState("");
  const initialized = useRef(false);

  const hasValidWindow = (wins: SchedulingWindow[]) =>
    wins.some((w) => isValidTimeRange(w.startTime, w.endTime));

  useEffect(() => {
    if (!referral) return;
    const pref = referral.schedulingPreference;
    const hasServerWindows = Boolean(pref?.windows?.length);

    // Only hydrate from server on first load or when backend has windows.
    if (!initialized.current || hasServerWindows) {
      setTimezone(pref?.timezone || DEFAULT_TIMEZONE);
      setLocationPreference(pref?.locationPreference || "either");
      setFrequency(pref?.frequency || "unsure");

      const cp = (pref?.clinicianPreferences as Record<string, any>) || {};
      setClinicianPreferences({
        language: (cp.language as string) || "",
        gender: (cp.gender as string) || "none",
        lgbtqAffirming: Boolean(cp.lgbtq_affirming || cp.lgbtqAffirming),
        culturalNotes: (cp.cultural_notes as string) || "",
      });
      setTimingCategories((cp.timing_categories as string[]) || []);

      const existingWindows =
        pref?.windows?.map((w, idx) => ({
          id: `win-${idx}`,
          day: (w.day || w["day"] || "").toString() || "Monday",
          startTime: w.start_time || w["start_time"] || "",
          endTime: w.end_time || w["end_time"] || "",
        })) ?? [];

      if (existingWindows.length) {
        setWindows(existingWindows);
      } else if (!initialized.current) {
        // Seed a blank row on first load when no server windows exist.
        setWindows([
          {
            id: `win-${Date.now()}`,
            day: "Monday",
            startTime: "",
            endTime: "",
          },
        ]);
      }

      setSuggestedWindows((pref?.suggestedWindows as SuggestedWindow[]) || []);
    }

    initialized.current = true;
  }, [referral]);

  useEffect(() => {
    if (!initialized.current || !referralId) return;
    if (!hasValidWindow(windows)) return;
    const handle = setTimeout(() => {
      void savePreferences(false);
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    referralId,
    timezone,
    locationPreference,
    frequency,
    JSON.stringify(windows),
    JSON.stringify(timingCategories),
    JSON.stringify(clinicianPreferences),
  ]);

  const buildPayload = () => {
    const windowsPayload = windows
      .filter((w) => w.day && w.startTime && w.endTime)
      .map((w) => ({
        day: w.day.toLowerCase(),
        start_time: w.startTime,
        end_time: w.endTime,
      }));

    const prefsPayload: Record<string, any> = {};
    if (clinicianPreferences.language) prefsPayload.language = clinicianPreferences.language;
    if (clinicianPreferences.gender && clinicianPreferences.gender !== "none") {
      prefsPayload.gender = clinicianPreferences.gender;
    }
    if (clinicianPreferences.lgbtqAffirming) prefsPayload.lgbtq_affirming = true;
    if (clinicianPreferences.culturalNotes) {
      prefsPayload.cultural_notes = clinicianPreferences.culturalNotes;
    }
    if (timingCategories.length) {
      prefsPayload.timing_categories = timingCategories;
    }

    return {
      timezone,
      locationPreference,
      frequency,
      windows: windowsPayload,
      clinicianPreferences: prefsPayload,
    };
  };

  const savePreferences = async (showErrors: boolean) => {
    if (!referralId) return false;
    setServerError("");
    setWindowError("");

    const windowsPayload = buildPayload().windows;
    if (!windowsPayload.length || !hasValidWindow(windows)) {
      setWindowError(requiredFieldsMessage);
      setAutosaveStatus("error");
      return false;
    }

    setAutosaveStatus("saving");
    try {
      const { data } = await updateSchedulingPreferences({
        variables: {
          referralId,
          schedulingInput: buildPayload(),
        },
      });
      const errorsResp = data?.updateSchedulingPreferences?.errors;
      if (errorsResp?.length) {
        if (showErrors) setServerError(errorsResp[0]);
        setAutosaveStatus("error");
        return false;
      }
      const returnedPref = data?.updateSchedulingPreferences?.schedulingPreference;
      setSuggestedWindows((returnedPref?.suggestedWindows as SuggestedWindow[]) || []);
      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus("idle"), 1200);
      return true;
    } catch {
      if (showErrors) setServerError("Unable to save scheduling preferences right now.");
      setAutosaveStatus("error");
      return false;
    }
  };

  const handleContinue = async () => {
    if (!hasValidWindow(windows)) {
      setWindowError(requiredFieldsMessage);
      setServerError("");
      setAutosaveStatus("error");
      return;
    }
    const success = await savePreferences(true);
    if (!success) return;
    const next = getNextStep("scheduling");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const handleBack = () => {
    const prev = getPreviousStep("scheduling");
    void router.push(`/parent/referrals/${referralId}/onboarding/${prev}`);
  };

  const addWindow = (day: string) => {
    setWindows((prev) => [
      ...prev,
      { id: `win-${Date.now()}-${prev.length}`, day, startTime: "", endTime: "" },
    ]);
  };

  const updateWindow = (idValue: string, field: "startTime" | "endTime", value: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === idValue ? { ...w, [field]: value } : w)),
    );
  };

  const removeWindow = (idValue: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== idValue));
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>Loading scheduling…</div>
      </ProtectedRoute>
    );
  }

  if (error || !referral) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <p>Unable to load this referral.</p>
          <Button onClick={() => router.push("/parent/dashboard")}>Back to dashboard</Button>
        </div>
      </ProtectedRoute>
    );
  }

  const stepNumber = 7;
  const totalSteps = 9;

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep="scheduling"
        onStepSelect={(target) =>
          target === "scheduling"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2>When are sessions possible?</h2>
            <p className="muted">
              Share the times that could work. We’ll suggest 1–3 windows that best match clinician
              availability.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
          </div>
        </div>

        {serverError ? <ValidationError message={serverError} /> : null}
        {windowError && !serverError ? <ValidationError message={windowError} /> : null}

        <SchedulingForm
          timezone={timezone}
          locationPreference={locationPreference}
          frequency={frequency}
          timingCategories={timingCategories}
          clinicianPreferences={clinicianPreferences}
          windows={windows}
          suggestedWindows={suggestedWindows}
          onTimezoneChange={setTimezone}
          onLocationChange={setLocationPreference}
          onFrequencyChange={setFrequency}
          onTimingCategoriesChange={setTimingCategories}
          onClinicianPreferencesChange={(prefs) =>
            setClinicianPreferences({
              language: prefs.language ?? "",
              gender: prefs.gender ?? "none",
              lgbtqAffirming: Boolean(prefs.lgbtqAffirming),
              culturalNotes: prefs.culturalNotes ?? "",
            })
          }
          onAddWindow={addWindow}
          onUpdateWindow={updateWindow}
          onRemoveWindow={removeWindow}
          windowError={windowError}
        />

        <div className="nav-actions">
          <Button variant="ghost" onClick={() => void handleBack()}>
            Back
          </Button>
          <Button onClick={() => void handleContinue()}>Save & Continue</Button>
        </div>

        <style jsx>{`
          .step-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }

          .eyebrow {
            color: var(--color-primary-teal);
            font-weight: 700;
            margin: 0;
          }

          h2 {
            margin: 4px 0;
            color: var(--color-deep-aqua);
          }

          .muted {
            margin: 0;
            color: var(--color-muted);
            max-width: 760px;
          }

          .save-indicator {
            font-weight: 600;
            color: var(--color-muted);
          }

          .nav-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 12px;
          }

          @media (max-width: 768px) {
            .nav-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </OnboardingWizard>
    </ProtectedRoute>
  );
}

function isValidTimeRange(start?: string, end?: string) {
  if (!start || !end) return false;
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes === null || endMinutes === null) return false;
  return startMinutes < endMinutes;
}

function toMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

