import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import CostEstimatePanel from "@/components/cost/CostEstimatePanel";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep, ONBOARDING_STEPS } from "@/lib/onboardingSteps";
import { RECALCULATE_COST_ESTIMATE } from "@/lib/graphql/mutations/insurance.graphql";
import { UPDATE_REFERRAL_STEP } from "@/lib/graphql/mutations/referrals.graphql";

export default function CostStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error, refetch } = useReferral(referralId);

  const [recalculateCostEstimate] = useMutation(RECALCULATE_COST_ESTIMATE);
  const [updateReferralStep] = useMutation(UPDATE_REFERRAL_STEP);

  useEffect(() => {
    if (!referralId) return;
    if (referral?.costEstimate) return;
    void recalculateCostEstimate({ variables: { referralId } }).then(() => refetch());
  }, [recalculateCostEstimate, refetch, referral?.costEstimate, referralId]);

  const handleContinue = async () => {
    await updateReferralStep({
      variables: {
        referralId,
        stepName: "cost",
        stepData: { completed: true },
      },
    });
    const next = getNextStep("cost");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const handleBack = () => {
    const prev = getPreviousStep("cost");
    void router.push(`/parent/referrals/${referralId}/onboarding/${prev}`);
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>Loading cost estimate…</div>
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

  const costEstimate = referral.costEstimate ?? null;
  const inputsHint = `Based on your district (${referral.child.district}) and insurance status (${referral.insuranceDetail?.insuranceStatus ||
    "unknown"})`;
  const stepNumber = ONBOARDING_STEPS.indexOf("cost") + 1;
  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep="cost"
        onStepSelect={(target) =>
          void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2>Understand your potential costs</h2>
            <p className="muted">
              This estimate is informational and may change after we review your details. We’ll confirm before any session.
            </p>
          </div>
        </div>

        <CostEstimatePanel costEstimate={costEstimate} loading={!costEstimate} inputsHint={inputsHint} />

        <div className="nav-actions">
          <Button variant="ghost" onClick={() => void handleBack()}>
            Back
          </Button>
          <Button onClick={() => void handleContinue()}>Continue</Button>
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
            max-width: 720px;
          }

          .nav-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
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


