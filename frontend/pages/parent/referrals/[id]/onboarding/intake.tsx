import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep } from "@/lib/onboardingSteps";
import { UPDATE_CLINICAL_INTAKE } from "@/lib/graphql/mutations/referrals.graphql";
import TextAreaInput from "@/components/forms/TextAreaInput";
import SelectInput from "@/components/forms/SelectInput";
import CheckboxGroup from "@/components/forms/CheckboxGroup";
import FormSection from "@/components/forms/FormSection";
import ValidationError from "@/components/forms/ValidationError";

type IntakeForm = {
  primaryConcerns: string[];
  primaryConcernsOther: string;
  description: string;
  duration: string;
  schoolImpact: string[];
  homeImpact: string[];
  socialImpact: string[];
  priorTherapy: string;
  priorTherapyDetails: string;
  currentSupports: string[];
  medications: string;
  safetyConcerns: string;
  parentGoals: string;
};

const concernOptions = [
  "Anxiety",
  "Depression",
  "School avoidance",
  "Behavioral issues",
  "Peer relationships",
  "Family stress",
  "Sleep problems",
  "Eating concerns",
].map((c) => ({ value: c, label: c }));

const durationOptions = [
  "Less than 1 month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "Over a year",
].map((d) => ({ value: d, label: d }));

const impactOptions = (scope: "school" | "home" | "social") => {
  const base =
    scope === "school"
      ? ["Grades dropping", "Attendance issues", "Peer conflicts", "Teacher concerns", "None"]
      : scope === "home"
        ? ["Family conflicts", "Withdrawn behavior", "Sleep changes", "Appetite changes", "None"]
        : ["Friendship problems", "Social withdrawal", "Risky behaviors", "None"];
  return base.map((v) => ({ value: v, label: v }));
};

const supportOptions = [
  "School counselor",
  "Therapist",
  "Psychiatrist",
  "Pediatrician",
  "Support group",
  "None",
].map((s) => ({ value: s, label: s }));

export default function IntakeStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error } = useReferral(referralId);
  const [updateClinicalIntake] = useMutation(UPDATE_CLINICAL_INTAKE);
  const [serverError, setServerError] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const initialized = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<IntakeForm>({
    mode: "onBlur",
    defaultValues: {
      primaryConcerns: [],
      primaryConcernsOther: "",
      description: "",
      duration: "",
      schoolImpact: [],
      homeImpact: [],
      socialImpact: [],
      priorTherapy: "",
      priorTherapyDetails: "",
      currentSupports: [],
      medications: "",
      safetyConcerns: "",
      parentGoals: "",
    },
  });

  useEffect(() => {
    const resp = referral?.intakeResponse?.responses as Record<string, any> | undefined;
    if (!resp) {
      initialized.current = true;
      return;
    }
    const priorTherapyValue = resp.prior_therapy
    const priorTherapy =
      priorTherapyValue === true ? "yes" : priorTherapyValue === false ? "no" : "";

    reset({
      primaryConcerns: resp.primary_concerns ?? [],
      primaryConcernsOther: resp.primary_concerns_other ?? "",
      description: resp.description ?? "",
      duration: resp.duration ?? "",
      schoolImpact: resp.impacts?.school ?? [],
      homeImpact: resp.impacts?.home ?? [],
      socialImpact: resp.impacts?.social ?? [],
      priorTherapy,
      priorTherapyDetails: resp.prior_therapy_details ?? "",
      currentSupports: resp.current_supports ?? [],
      medications: resp.medications ?? "",
      safetyConcerns: resp.safety_concerns ?? "",
      parentGoals: resp.parent_goals ?? "",
    });
    initialized.current = true;
  }, [referral, reset]);

  const hasMeaningfulData = (values: IntakeForm) =>
    (values.primaryConcerns && values.primaryConcerns.length > 0) ||
    (values.description && values.description.trim().length > 0) ||
    (values.parentGoals && values.parentGoals.trim().length > 0) ||
    (values.duration && values.duration.trim().length > 0);

  const saveIntake = async (values: IntakeForm, allowEmpty = false) => {
    if (!referralId) return;
    if (!allowEmpty && !hasMeaningfulData(values)) {
      setAutosaveStatus("idle");
      return;
    }
    setServerError("");
    setAutosaveStatus("saving");
    try {
      const payload = {
        primary_concerns: values.primaryConcerns,
        primary_concerns_other: values.primaryConcernsOther,
        description: values.description,
        duration: values.duration,
        impacts: {
          school: values.schoolImpact,
          home: values.homeImpact,
          social: values.socialImpact,
        },
        prior_therapy: values.priorTherapy === "yes",
        prior_therapy_details: values.priorTherapyDetails,
        current_supports: values.currentSupports,
        medications: values.medications,
        safety_concerns: values.safetyConcerns,
        parent_goals: values.parentGoals,
      };
      const { data } = await updateClinicalIntake({
        variables: { referralId, intakeInput: { responses: payload } },
      });
      const errorsResp = data?.updateClinicalIntake?.errors;
      if (errorsResp?.length) {
        setServerError(errorsResp[0]);
        setAutosaveStatus("error");
        return;
      }
      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus("idle"), 1200);
    } catch {
      setServerError("Unable to save intake right now. Please try again.");
      setAutosaveStatus("error");
    }
  };

  const watched = watch();
  useEffect(() => {
    if (!initialized.current || !referralId) return;
    if (!isDirty && !hasMeaningfulData(watched)) return;
    const handle = setTimeout(() => {
      void saveIntake(watched, false);
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId, JSON.stringify(watched), isDirty]);

  const onSubmit = async (values: IntakeForm) => {
    if (!hasMeaningfulData(values)) {
      setServerError("Please share at least one concern or description.");
      setAutosaveStatus("error");
      return;
    }
    await saveIntake(values, true);
    const next = getNextStep("intake");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const goBack = () => {
    const prev = getPreviousStep("intake");
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
        currentStep="intake"
        onStepSelect={(target) =>
          target === "intake"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step 4 of 9</p>
            <h2>What’s been happening</h2>
            <p className="muted">Share the context so we understand your child’s needs.</p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
          </div>
        </div>

        {serverError ? <ValidationError message={serverError} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Clinical intake form">
          <FormSection
            title="What brings you here?"
            description="Start with the top concerns in your own words."
          >
            <CheckboxGroup
              name="primaryConcerns"
              label="Primary concerns (choose all that fit)"
              options={concernOptions}
              selectedValues={watch("primaryConcerns")}
              onChange={(vals) => setValue("primaryConcerns", vals, { shouldValidate: true })}
              error={errors.primaryConcerns?.message}
            />
            <TextAreaInput
              id="primaryConcernsOther"
              label="Other concerns (optional)"
              {...register("primaryConcernsOther")}
            />
            <TextAreaInput
              id="description"
              label="Describe what’s been happening"
              required
              error={errors.description?.message}
              {...register("description", { required: "Please describe what’s been happening" })}
            />
            <SelectInput
              id="duration"
              label="How long has this been going on?"
              required
              options={durationOptions}
              error={errors.duration?.message}
              {...register("duration", { required: "Duration is required" })}
            />
          </FormSection>

          <FormSection title="How is this affecting your child?">
            <CheckboxGroup
              name="schoolImpact"
              label="School"
              options={impactOptions("school")}
              selectedValues={watch("schoolImpact")}
              onChange={(vals) => setValue("schoolImpact", vals, { shouldValidate: true })}
            />
            <CheckboxGroup
              name="homeImpact"
              label="Home"
              options={impactOptions("home")}
              selectedValues={watch("homeImpact")}
              onChange={(vals) => setValue("homeImpact", vals, { shouldValidate: true })}
            />
            <CheckboxGroup
              name="socialImpact"
              label="Social"
              options={impactOptions("social")}
              selectedValues={watch("socialImpact")}
              onChange={(vals) => setValue("socialImpact", vals, { shouldValidate: true })}
            />
          </FormSection>

          <FormSection title="History & supports">
            <SelectInput
              id="priorTherapy"
              label="Has your child received therapy or evaluation before?"
              required
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              error={errors.priorTherapy?.message}
              {...register("priorTherapy", { required: "Please select an option" })}
            />
            {watch("priorTherapy") === "yes" ? (
              <TextAreaInput
                id="priorTherapyDetails"
                label="Tell us about previous therapy (optional)"
                {...register("priorTherapyDetails")}
              />
            ) : null}
            <CheckboxGroup
              name="currentSupports"
              label="Current supports"
              options={supportOptions}
              selectedValues={watch("currentSupports")}
              onChange={(vals) => setValue("currentSupports", vals, { shouldValidate: true })}
            />
            <TextAreaInput
              id="medications"
              label="Current medications (optional)"
              {...register("medications")}
            />
          </FormSection>

          <FormSection
            title="Safety"
            description="This is not an emergency service. If you have an immediate safety concern, call 911 or visit the nearest ER."
          >
            <TextAreaInput
              id="safetyConcerns"
              label="Any immediate safety concerns? (optional)"
              {...register("safetyConcerns")}
            />
          </FormSection>

          <FormSection title="Goals">
            <TextAreaInput
              id="parentGoals"
              label="What are you hoping for?"
              required
              error={errors.parentGoals?.message}
              {...register("parentGoals", { required: "Please share your goals" })}
            />
          </FormSection>

          <div className="actions">
            <Button type="button" variant="ghost" onClick={goBack}>
              Back
            </Button>
            <Button type="submit">Save & Continue</Button>
          </div>
        </form>

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
          form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
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

