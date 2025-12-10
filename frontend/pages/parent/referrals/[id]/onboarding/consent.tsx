import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep } from "@/lib/onboardingSteps";
import { ACCEPT_CONSENTS } from "@/lib/graphql/mutations/referrals.graphql";
import ValidationError from "@/components/forms/ValidationError";

const REQUIRED_TYPES = [
  "terms_of_use",
  "privacy_policy",
  "non_emergency_acknowledgment",
  "telehealth_consent",
  "guardian_authorization",
] as const;

const CONSENT_ENUM_MAP: Record<(typeof REQUIRED_TYPES)[number], string> = {
  terms_of_use: "TERMS_OF_USE",
  privacy_policy: "PRIVACY_POLICY",
  non_emergency_acknowledgment: "NON_EMERGENCY_ACKNOWLEDGMENT",
  telehealth_consent: "TELEHEALTH_CONSENT",
  guardian_authorization: "GUARDIAN_AUTHORIZATION",
};

type ConsentState = Record<(typeof REQUIRED_TYPES)[number], boolean>;

export default function ConsentStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error, refetch } = useReferral(referralId);
  const [acceptConsents] = useMutation(ACCEPT_CONSENTS);
  const [serverError, setServerError] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [consents, setConsents] = useState<ConsentState>({
    terms_of_use: false,
    privacy_policy: false,
    non_emergency_acknowledgment: false,
    telehealth_consent: false,
    guardian_authorization: false,
  });

  useEffect(() => {
    if (!referral?.consentRecords) return;
    const map: ConsentState = {
      terms_of_use: false,
      privacy_policy: false,
      non_emergency_acknowledgment: false,
      telehealth_consent: false,
      guardian_authorization: false,
    };
    referral.consentRecords.forEach((c) => {
      if (REQUIRED_TYPES.includes(c.consentType as any)) {
        map[c.consentType as keyof ConsentState] = true;
      }
    });
    setConsents(map);
  }, [referral]);

  const allChecked = REQUIRED_TYPES.every((t) => consents[t]);

  const persistConsents = async (nextStep?: boolean) => {
    if (!referralId) return;
    if (!allChecked) {
      setServerError("Please accept all required consents to continue.");
      setAutosaveStatus("error");
      return;
    }
    setServerError("");
    setAutosaveStatus("saving");
    try {
      const now = new Date().toISOString();
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
      const { data } = await acceptConsents({
        variables: {
          referralId,
          consents: REQUIRED_TYPES.map((consent_type) => ({
            consentType: CONSENT_ENUM_MAP[consent_type],
            acceptedAt: now,
            ipAddress: null,
            userAgent: ua,
          })),
        },
        refetchQueries: ["Referral"],
        awaitRefetchQueries: true,
      });
      const errorsResp = data?.acceptConsents?.errors;
      const records = data?.acceptConsents?.consentRecords ?? [];
      if (errorsResp?.length || records.length < REQUIRED_TYPES.length) {
        setServerError(
          "We couldn’t save all consents. Please try again. If this continues, refresh and retry.",
        );
        setAutosaveStatus("error");
        return;
      }
      await refetch();
      setConsents({
        terms_of_use: true,
        privacy_policy: true,
        non_emergency_acknowledgment: true,
        telehealth_consent: true,
        guardian_authorization: true,
      });
      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus("idle"), 1200);
      if (nextStep) {
        const next = getNextStep("consent");
        void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
      }
    } catch {
      setServerError("Unable to save consents right now. Please try again.");
      setAutosaveStatus("error");
    }
  };

  const toggle = (key: (typeof REQUIRED_TYPES)[number]) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!allChecked) return;
    void persistConsents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const goBack = () => {
    const prev = getPreviousStep("consent");
    void router.push(`/parent/referrals/${referralId}/onboarding/${prev}`);
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>Loading referral…</div>
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

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep="consent"
        onStepSelect={(target) =>
          target === "consent"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step 8 of 9</p>
            <h2>Review and consent</h2>
            <p className="muted">
              Please review and accept all required consents. This site is not for emergencies.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
          </div>
        </div>

        {serverError ? <ValidationError message={serverError} /> : null}

        <div className="consent-list">
          <ConsentCard
            title="Terms of Use"
            description="I have read and agree to Daybreak's Terms of Use."
            checked={consents.terms_of_use}
            onChange={() => toggle("terms_of_use")}
            linkLabel="Read Terms of Use"
            linkHref="#"
          />
          <ConsentCard
            title="Privacy Policy"
            description="I have read and agree to Daybreak's Privacy Policy and understand how my data will be used."
            checked={consents.privacy_policy}
            onChange={() => toggle("privacy_policy")}
            linkLabel="Read Privacy Policy"
            linkHref="#"
          />
          <ConsentCard
            title="Non-emergency acknowledgment"
            description="I understand this site is not for emergencies. For emergencies, I will call 911 or go to the nearest ER."
            checked={consents.non_emergency_acknowledgment}
            onChange={() => toggle("non_emergency_acknowledgment")}
            emphasis
          />
          <ConsentCard
            title="Telehealth consent"
            description="I consent to receiving mental health services via telehealth where appropriate."
            checked={consents.telehealth_consent}
            onChange={() => toggle("telehealth_consent")}
          />
          <ConsentCard
            title="Guardian authorization"
            description="I confirm that I am the legal guardian of this child and have the authority to seek care on their behalf."
            checked={consents.guardian_authorization}
            onChange={() => toggle("guardian_authorization")}
          />
        </div>

        <div className="actions">
          <Button type="button" variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button type="button" disabled={!allChecked} onClick={() => void persistConsents(true)}>
            Save & Continue
          </Button>
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
          }
          .save-indicator {
            font-weight: 600;
            color: var(--color-muted);
          }
          .consent-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 14px;
            margin: 12px 0;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 8px;
          }
        `}</style>
      </OnboardingWizard>
    </ProtectedRoute>
  );
}

type ConsentCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  linkLabel?: string;
  linkHref?: string;
  emphasis?: boolean;
};

function ConsentCard({
  title,
  description,
  checked,
  onChange,
  linkLabel,
  linkHref,
  emphasis,
}: ConsentCardProps) {
  return (
    <div className={`consent-card ${emphasis ? "emphasis" : ""}`}>
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="content">
          <h3>{title}</h3>
          <p>{description}</p>
          {linkLabel && linkHref ? (
            <a href={linkHref} target="_blank" rel="noreferrer">
              {linkLabel}
            </a>
          ) : null}
        </div>
      </label>
      <style jsx>{`
        .consent-card {
          background: var(--color-warm-beige);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 14px;
        }
        .consent-card.emphasis {
          border-color: var(--color-accent-red);
        }
        label {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          cursor: pointer;
        }
        input[type="checkbox"] {
          margin-top: 6px;
          width: 18px;
          height: 18px;
        }
        .content h3 {
          margin: 0 0 4px;
        }
        .content p {
          margin: 0 0 6px;
          color: var(--color-text);
        }
        a {
          color: var(--color-primary-teal);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

