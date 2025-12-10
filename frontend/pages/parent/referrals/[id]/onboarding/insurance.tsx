import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep, ONBOARDING_STEPS } from "@/lib/onboardingSteps";
import {
  UPDATE_INSURANCE_DETAILS,
  UPDATE_REFERRAL_STEP,
} from "@/lib/graphql/mutations/referrals.graphql";
import {
  RECALCULATE_COST_ESTIMATE,
  START_INSURANCE_UPLOAD,
  TRIGGER_INSURANCE_OCR,
} from "@/lib/graphql/mutations/insurance.graphql";
import InsuranceForm, { type InsuranceFormValues } from "@/components/forms/InsuranceForm";
import ImageUpload from "@/components/forms/ImageUpload";

type InsuranceStatusOption = {
  value: InsuranceFormValues["insuranceStatus"];
  label: string;
  description: string;
};

const STATUS_OPTIONS: InsuranceStatusOption[] = [
  { value: "insured", label: "My child has insurance", description: "Upload your card if you can—it helps us verify faster." },
  { value: "medicaid", label: "My child has Medicaid", description: "Upload your card if available, or continue without." },
  { value: "uninsured", label: "My child does not have insurance", description: "You can still continue without uploading a card." },
  { value: "not_sure", label: "I'm not sure", description: "Select this if you're unsure. You can still submit without a card." },
];

export default function InsuranceStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error, refetch } = useReferral(referralId);

  const [updateInsuranceDetails] = useMutation(UPDATE_INSURANCE_DETAILS);
  const [updateReferralStep] = useMutation(UPDATE_REFERRAL_STEP);
  const [startInsuranceUpload] = useMutation(START_INSURANCE_UPLOAD);
  const [triggerInsuranceOcr] = useMutation(TRIGGER_INSURANCE_OCR);
  const [recalculateCostEstimate] = useMutation(RECALCULATE_COST_ESTIMATE);

  const [formValues, setFormValues] = useState<InsuranceFormValues>({
    insuranceStatus: "",
    insurerName: "",
    planName: "",
    memberId: "",
    groupId: "",
    policyholderName: "",
    coveragePhone: "",
    coverageWebsite: "",
  });

  const [statusError, setStatusError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [ocrPolling, setOcrPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastOcrStatusRef = useRef<string | null>(null);

  const insuranceUpload = referral?.insuranceUploads?.[0];
  const ocrStatus = insuranceUpload?.ocrStatus ?? null;
  const ocrConfidence = insuranceUpload?.ocrConfidence ?? null;

  useEffect(() => {
    if (!referral?.insuranceDetail) return;
    const detail = referral.insuranceDetail;
    setFormValues((prev) => ({
      ...prev,
      insuranceStatus: detail.insuranceStatus,
      insurerName: detail.insurerName ?? "",
      planName: detail.planName ?? "",
      memberId: detail.memberId ?? "",
      groupId: detail.groupId ?? "",
      policyholderName: detail.policyholderName ?? "",
      coveragePhone: detail.coveragePhone ?? "",
      coverageWebsite: detail.coverageWebsite ?? "",
    }));
  }, [referral?.insuranceDetail]);

  useEffect(() => {
    if (!ocrStatus) return;
    if (lastOcrStatusRef.current === "processing" && ocrStatus === "complete") {
      setOcrMessage(
        ocrConfidence && ocrConfidence < 0.7
          ? "We read your card, but confidence was low. Please review the details below."
          : "We read your card. Please review the details below.",
      );
    } else if (ocrStatus === "failed") {
      setOcrMessage("We couldn't read your card. You can still complete this step by typing the details.");
    }
    lastOcrStatusRef.current = ocrStatus;
  }, [ocrStatus, ocrConfidence]);

  useEffect(() => {
    if (!ocrPolling) return;
    pollingRef.current = setInterval(() => {
      void refetch();
    }, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [ocrPolling, refetch]);

  const stopPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setOcrPolling(false);
  };

  useEffect(() => {
    if (!ocrPolling) return;
    if (ocrStatus === "complete" || ocrStatus === "failed") {
      stopPolling();
    }
  }, [ocrPolling, ocrStatus]);

  const saveInsurance = async (values: InsuranceFormValues) => {
    if (!referralId) return;
    setSaving(true);
    setStatusError("");
    try {
      const { data } = await updateInsuranceDetails({
        variables: { referralId, insuranceInput: values },
      });
      const errorsResp = data?.updateInsuranceDetails?.errors;
      if (errorsResp?.length) {
        setStatusError(errorsResp[0]);
      } else {
        await recalculateCostEstimate({ variables: { referralId } });
      }
    } catch (e) {
      setStatusError("Unable to save insurance details right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusSelect = async (statusValue: InsuranceFormValues["insuranceStatus"]) => {
    const nextValues = { ...formValues, insuranceStatus: statusValue };
    setFormValues(nextValues);
    await saveInsurance(nextValues);
  };

  const handleManualSave = async (values: InsuranceFormValues) => {
    const payload = { ...values, insuranceStatus: formValues.insuranceStatus };
    setFormValues(payload);
    await saveInsurance(payload);
  };

  const handleUploadComplete = async (fileType: "front" | "back", key: string) => {
    if (!referralId) return;
    const payload: { frontImageS3Key?: string; backImageS3Key?: string } = {};
    if (fileType === "front") {
      payload.frontImageS3Key = key;
      payload.backImageS3Key = insuranceUpload?.backImageS3Key ?? undefined;
    } else {
      payload.backImageS3Key = key;
      payload.frontImageS3Key = insuranceUpload?.frontImageS3Key ?? undefined;
    }

    await startInsuranceUpload({
      variables: {
        referralId,
        frontImageS3Key: payload.frontImageS3Key,
        backImageS3Key: payload.backImageS3Key,
      },
    });
    await refetch();
  };

  const handleProcessCard = async () => {
    if (!referralId) return;
    if (!insuranceUpload?.frontImageS3Key && !insuranceUpload?.backImageS3Key) {
      setOcrMessage("Please upload the front or back of your card first.");
      return;
    }
    setOcrMessage("Reading your card…");
    setOcrPolling(true);
    await triggerInsuranceOcr({ variables: { referralId } });
  };

  const handleContinue = async () => {
    if (!formValues.insuranceStatus) {
      setStatusError("Please select your insurance status to continue.");
      return;
    }
    await updateReferralStep({
      variables: {
        referralId,
        stepName: "insurance",
        stepData: { completed: true },
      },
    });
    const next = getNextStep("insurance");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const handleBack = () => {
    const prev = getPreviousStep("insurance");
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

  const showUploads = ["insured", "medicaid"].includes(formValues.insuranceStatus);
  const stepNumber = ONBOARDING_STEPS.indexOf("insurance") + 1;
  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <ProtectedRoute requireRole="parent">
      <OnboardingWizard
        referralId={referral.id}
        currentStep="insurance"
        onStepSelect={(target) =>
          void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2>Insurance information</h2>
            <p className="muted">
              Select your insurance status and upload your card if available. You can always enter
              details manually.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {saving ? "Saving…" : statusError ? statusError : ""}
          </div>
        </div>

        <div className="card">
          <h3>Insurance status (required)</h3>
          <div className="status-grid">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`status-card ${
                  formValues.insuranceStatus === option.value ? "selected" : ""
                }`}
                onClick={() => void handleStatusSelect(option.value)}
                aria-pressed={formValues.insuranceStatus === option.value}
              >
                <span className="status-label">{option.label}</span>
                <span className="status-desc">{option.description}</span>
              </button>
            ))}
          </div>
          {statusError ? <p className="error">{statusError}</p> : null}
        </div>

        {showUploads ? (
          <div className="card">
            <h3>Upload your card (optional but encouraged)</h3>
            <p className="muted">
              Upload the front and back of your insurance card. We’ll read it automatically so you can confirm the details.
            </p>
            <div className="upload-grid">
              <ImageUpload
                referralId={referralId}
                fileType="front"
                label="Front of card"
                existingKey={insuranceUpload?.frontImageS3Key}
                onUploaded={(key) => handleUploadComplete("front", key)}
              />
              <ImageUpload
                referralId={referralId}
                fileType="back"
                label="Back of card"
                existingKey={insuranceUpload?.backImageS3Key}
                onUploaded={(key) => handleUploadComplete("back", key)}
              />
            </div>
            <div className="ocr-row">
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleProcessCard()}
                disabled={ocrStatus === "processing"}
              >
                {ocrStatus === "processing" ? "Processing..." : "Process my card"}
              </Button>
              <p className="muted" aria-live="polite">
                {ocrStatus === "processing" ? "Reading your card…" : ocrMessage}
              </p>
              {ocrConfidence ? (
                <p className="confidence">Confidence: {Math.round(ocrConfidence * 100)}%</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="card">
          <h3>Review or enter details manually</h3>
          <p className="muted">
            If we read your card, the fields are pre-filled below. You can edit anything before continuing.
          </p>
          <InsuranceForm
            initialValues={formValues}
            onSubmit={handleManualSave}
            saving={saving}
          />
        </div>

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
          }

          .save-indicator {
            font-weight: 600;
            color: var(--color-muted);
            min-height: 20px;
          }

          .card {
            border: 1px solid var(--color-border);
            border-radius: 16px;
            padding: 16px;
            background: #fff;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 12px;
          }

          .status-card {
            border: 1px solid var(--color-border);
            border-radius: 12px;
            background: #fff;
            text-align: left;
            padding: 12px;
            cursor: pointer;
            transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
          }

          .status-card.selected {
            border-color: var(--color-primary-teal);
            box-shadow: 0 8px 22px rgba(0, 150, 168, 0.12);
            transform: translateY(-1px);
          }

          .status-label {
            display: block;
            font-weight: 700;
            color: var(--color-deep-aqua);
          }

          .status-desc {
            color: var(--color-muted);
            font-size: 14px;
          }

          .error {
            color: var(--color-accent-red);
            font-weight: 700;
            margin: 0;
          }

          .upload-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 12px;
          }

          .ocr-row {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
          }

          .confidence {
            margin: 0;
            font-weight: 600;
            color: var(--color-muted);
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


