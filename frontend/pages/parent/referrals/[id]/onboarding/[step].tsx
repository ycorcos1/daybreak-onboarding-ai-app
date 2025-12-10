import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import useReferral from "@/hooks/useReferral";
import useAutosave from "@/hooks/useAutosave";
import {
  getNextStep,
  getPreviousStep,
  ONBOARDING_STEPS,
  STEP_LABELS,
} from "@/lib/onboardingSteps";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";

export default function OnboardingStepPage() {
  const router = useRouter();
  const { id, step } = router.query;
  const stepName = useMemo(() => (step as string) || "", [step]);
  const isValidStep = ONBOARDING_STEPS.includes(stepName);

  useEffect(() => {
    if (step && !isValidStep) {
      void router.replace("/parent/dashboard");
    }
  }, [isValidStep, router, step]);

  const { referral, loading, error } = useReferral(id as string | undefined);
  const [note, setNote] = useState("");

  const hasNote = note.trim().length > 0;

  const { status: autosaveStatus, saveNow } = useAutosave({
    referralId: referral?.id,
    stepName,
    stepData: hasNote ? { note } : undefined,
    enabled: isValidStep && Boolean(referral?.id) && hasNote,
  });

  useEffect(() => {
    setNote("");
  }, [stepName]);

  const goNext = async () => {
    if (hasNote) {
      await saveNow();
    }
    const next = getNextStep(stepName);
    void router.push(`/parent/referrals/${id}/onboarding/${next}`);
  };

  const goBack = async () => {
    if (hasNote) {
      await saveNow();
    }
    const prev = getPreviousStep(stepName);
    void router.push(`/parent/referrals/${id}/onboarding/${prev}`);
  };

  if (!isValidStep) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          Loading referral…
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !referral) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <p>Unable to load this referral.</p>
          <Button onClick={() => router.push("/parent/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep={stepName}
        onStepSelect={(target) =>
          ONBOARDING_STEPS.indexOf(target) <= ONBOARDING_STEPS.indexOf(stepName)
            ? void router.push(
                `/parent/referrals/${referral.id}/onboarding/${target}`,
              )
            : undefined
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step {ONBOARDING_STEPS.indexOf(stepName) + 1}</p>
            <h2>{STEP_LABELS[stepName]}</h2>
            <p className="muted">
              Placeholder content for this step. Autosave will update your
              progress as you type.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
            {autosaveStatus === "idle" && ""}
          </div>
        </div>

        <div className="form-area">
          <TextInput
            id="note"
            label="Notes for this step (placeholder)"
            placeholder="Type anything to trigger autosave…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => void saveNow()}
          />
        </div>

        <div className="nav-actions">
          <Button variant="ghost" onClick={() => void goBack()}>
            Back
          </Button>
          <Button onClick={() => void goNext()}>
            {stepName === "review" ? "Stay on review" : "Continue"}
          </Button>
        </div>
      </OnboardingWizard>
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
        }

        .save-indicator {
          font-weight: 600;
          color: var(--color-muted);
        }

        .form-area {
          margin: 12px 0 20px;
        }

        .nav-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>
    </ProtectedRoute>
  );
}


