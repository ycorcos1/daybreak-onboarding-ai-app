import { useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import ReviewSummary from "@/components/onboarding/ReviewSummary";
import Button from "@/components/ui/Button";
import ValidationError from "@/components/forms/ValidationError";
import useReferral from "@/hooks/useReferral";
import { getPreviousStep } from "@/lib/onboardingSteps";
import { SUBMIT_REFERRAL } from "@/lib/graphql/mutations/referrals.graphql";
import { REFERRAL_STATUS_QUERY } from "@/lib/graphql/queries/referrals.graphql";

type SubmissionState = "idle" | "submitting" | "polling" | "complete";

const REQUIRED_CONSENTS = [
  "terms_of_use",
  "privacy_policy",
  "non_emergency_acknowledgment",
  "telehealth_consent",
  "guardian_authorization",
];

export default function ReviewStep() {
  const router = useRouter();
  const client = useApolloClient();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error, refetch } = useReferral(referralId, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network",
  });
  useEffect(() => {
    if (referralId) {
      void refetch();
    }
  }, [referralId, refetch]);

  useEffect(() => {
    if (referral && referral.status !== "draft") {
      void router.replace(`/parent/referrals/${referral.id}/details`);
    }
  }, [referral, router]);

  const [submitReferral] = useMutation(SUBMIT_REFERRAL);

  const [errorMessage, setErrorMessage] = useState("");
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!referral) return;
    setMissingSections(computeMissingSections(referral));
  }, [referral]);

  const handleSubmit = async () => {
    if (!referralId) return;

    // Fetch latest referral data to avoid stale consent/state
    const { data: refetched } = await refetch();
    const freshReferral = refetched?.referral ?? referral;
    if (!freshReferral) return;

    const missing = computeMissingSections(freshReferral);
    if (missing.length) {
      setMissingSections(missing);
      setErrorMessage("Please complete the highlighted sections before submitting.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setSubmissionState("submitting");

    try {
      const { data } = await submitReferral({ variables: { referralId } });
      const errs = data?.submitReferral?.errors;
      if (errs?.length) {
        setErrorMessage(errs.join(" | "));
        setSubmissionState("idle");
        return;
      }
      setSubmissionState("polling");
      startPolling(referralId);
      void router.push(`/parent/referrals/${referralId}/details`);
    } catch {
      setErrorMessage("Unable to submit right now. Please try again.");
      setSubmissionState("idle");
    }
  };

  const startPolling = (targetId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    pollIntervalRef.current = setInterval(async () => {
      const { data } = await client.query({
        query: REFERRAL_STATUS_QUERY,
        variables: { id: targetId },
        fetchPolicy: "network-only",
      });
      const packetStatus = data?.referral?.packetStatus;
      if (packetStatus === "complete") {
        clearInterval(pollIntervalRef.current as NodeJS.Timeout);
        clearTimeout(pollTimeoutRef.current as NodeJS.Timeout);
        setSubmissionState("complete");
        setStatusMessage("We’ve generated your referral packet. Thank you!");
        void router.push(`/parent/referrals/${targetId}/details`);
      } else if (packetStatus === "failed") {
        clearInterval(pollIntervalRef.current as NodeJS.Timeout);
        clearTimeout(pollTimeoutRef.current as NodeJS.Timeout);
        setSubmissionState("idle");
        setErrorMessage("Packet generation failed. Our team has been notified.");
      }
    }, 2500);

    pollTimeoutRef.current = setTimeout(() => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setSubmissionState("idle");
      setStatusMessage(
        "Packet generation is taking longer than expected. We’ll notify you when it’s ready.",
      );
    }, 30000);
  };

  const handleEditStep = (step: string) => {
    if (!referralId) return;
    void router.push(`/parent/referrals/${referralId}/onboarding/${step}`);
  };

  const handleBack = () => {
    const prev = getPreviousStep("review");
    void router.push(`/parent/referrals/${referralId}/onboarding/${prev}`);
  };

  const handleSaveDraft = () => {
    void router.push("/parent/dashboard");
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>Loading review…</div>
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

  const isSubmitted = referral.status === "submitted" || submissionState === "complete";
  const stepNumber = 9;
  const totalSteps = 9;

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep="review"
        onStepSelect={(target) =>
          target === "review"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2>Review & submit</h2>
            <p className="muted">
              Check each section below. We’ll confirm everything and generate your referral packet.
            </p>
          </div>
        </div>

        {errorMessage ? <ValidationError message={errorMessage} /> : null}
        {statusMessage ? <StatusBanner tone="info" message={statusMessage} /> : null}
        {submissionState === "polling" ? (
          <StatusBanner
            tone="info"
            message="Submitting your referral and generating the packet…"
          />
        ) : null}
        {isSubmitted ? (
          <StatusBanner tone="success" message="Submitted. We’re preparing next steps." />
        ) : null}

        <ReviewSummary
          referral={referral}
          missingSections={missingSections}
          onEditStep={handleEditStep}
        />

        {referral.status === "draft" ? (
          <div className="nav-actions">
            <Button variant="ghost" onClick={() => void handleBack()}>
              Back
            </Button>
            <div className="cta-group">
              <Button variant="secondary" onClick={() => void handleSaveDraft()}>
                Save as draft
              </Button>
              <Button
                onClick={() => void handleSubmit()}
                disabled={submissionState === "submitting" || submissionState === "polling"}
              >
                {submissionState === "submitting"
                  ? "Submitting…"
                  : submissionState === "polling"
                    ? "Generating packet…"
                    : "Submit referral"}
              </Button>
            </div>
          </div>
        ) : null}

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

          .nav-actions {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 12px;
          }

          .cta-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          @media (max-width: 768px) {
            .nav-actions {
              flex-direction: column;
            }
            .cta-group {
              flex-direction: column;
            }
          }
        `}</style>
      </OnboardingWizard>
    </ProtectedRoute>
  );
}

function computeMissingSections(referral: any) {
  const missing: string[] = [];
  const user = referral.user || {};
  const child = referral.child || {};
  const intake = referral.intakeResponse?.responses || {};
  const screener = referral.aiScreenerSession?.summaryJsonb;
  const insuranceStatus = referral.insuranceDetail?.insuranceStatus;
  const scheduling = referral.schedulingPreference;
  const consentTypes = (referral.consentRecords || []).map(
    (c: any) => (c.consentType || "").toLowerCase(),
  );

  if (!user.name || !user.email || !user.phone) missing.push("Parent info");
  if (
    !child.name ||
    (!child.dob && !child.ageBand) ||
    !child.grade ||
    !child.schoolName ||
    !child.district
  ) {
    missing.push("Child info");
  }

  const hasConcern =
    (intake && (intake.primary_concerns?.length || intake.description || intake.parent_goals)) ||
    Boolean(screener);
  if (!hasConcern) missing.push("Clinical intake or screener");

  if (!insuranceStatus) missing.push("Insurance");

  const windows = (scheduling?.windows as Array<Record<string, string>>) || [];
  if (!scheduling || !scheduling.timezone || !scheduling.locationPreference || !windows.length) {
    missing.push("Scheduling");
  }

  const hasAllConsents = REQUIRED_CONSENTS.every((type) => consentTypes.includes(type));
  if (!hasAllConsents) missing.push("Consents");

  return missing;
}

function StatusBanner({ tone, message }: { tone: "info" | "success"; message: string }) {
  return (
    <div className={`status-banner status-banner--${tone}`} role="status" aria-live="polite">
      {message}
      <style jsx>{`
        .status-banner {
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .status-banner--info {
          background: #f4fbfd;
          border: 1px solid #b5e5ed;
          color: var(--color-deep-aqua);
        }

        .status-banner--success {
          background: #f1fbf5;
          border: 1px solid #b7e8c7;
          color: #1a7f49;
        }
      `}</style>
    </div>
  );
}

