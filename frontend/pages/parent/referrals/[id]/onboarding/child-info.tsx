import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep } from "@/lib/onboardingSteps";
import { UPDATE_CHILD_INFO } from "@/lib/graphql/mutations/referrals.graphql";
import TextInput from "@/components/forms/TextInput";
import SelectInput from "@/components/forms/SelectInput";
import ValidationError from "@/components/forms/ValidationError";

type ChildForm = {
  name: string;
  dob: string;
  ageBand: string;
  grade: string;
  schoolName: string;
  district: string;
  state: string;
  primaryLanguage: string;
  pronouns: string;
  howHeard: string;
};

const gradeOptions = [
  "Pre-K",
  "K",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "Not enrolled",
  "Graduated",
].map((g) => ({ value: g, label: g }));

const ageBandOptions = ["5-7", "8-10", "11-13", "14-17", "18+"].map((v) => ({
  value: v,
  label: v,
}));

const stateOptions = [
  "",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
].map((s) => ({ value: s, label: s || "Select state" }));

export default function ChildInfoStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error } = useReferral(referralId);
  const [updateChildInfo] = useMutation(UPDATE_CHILD_INFO);
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
    setError,
    formState: { errors, isDirty },
  } = useForm<ChildForm>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      dob: "",
      ageBand: "",
      grade: "",
      schoolName: "",
      district: "",
      state: "",
      primaryLanguage: "",
      pronouns: "",
      howHeard: "",
    },
  });

  useEffect(() => {
    if (!referral?.child) return;
    reset({
      name: referral.child.name ?? "",
      dob: referral.child.dob ?? "",
      ageBand: referral.child.ageBand ?? "",
      grade: referral.child.grade ?? "",
      schoolName: referral.child.schoolName ?? "",
      district: referral.child.district ?? "",
      state: referral.child.state ?? "",
      primaryLanguage: referral.child.primaryLanguage ?? "",
      pronouns: referral.child.pronouns ?? "",
      howHeard: "",
    });
    initialized.current = true;
  }, [referral, reset]);

  const validateDobOrAge = (values: ChildForm) => {
    if (!values.dob && !values.ageBand) {
      setError("dob", { message: "Enter a date of birth or select an age band" });
      setError("ageBand", { message: "Enter a date of birth or select an age band" });
      return false;
    }
    if (values.dob) {
      const age =
        Math.abs(new Date(Date.now() - new Date(values.dob).getTime()).getUTCFullYear() - 1970);
      if (age < 3 || age > 19) {
        setError("dob", { message: "Please enter a valid age between 3 and 19" });
        return false;
      }
    }
    return true;
  };

  const saveChildInfo = async (values: ChildForm) => {
    if (!referralId) return;
    if (!validateDobOrAge(values)) {
      setAutosaveStatus("error");
      return;
    }
    setServerError("");
    setAutosaveStatus("saving");
    try {
      const { data } = await updateChildInfo({
        variables: {
          referralId,
          childInput: {
            name: values.name,
            dob: values.dob || null,
            ageBand: values.ageBand || null,
            grade: values.grade,
            schoolName: values.schoolName,
            district: values.district,
            state: values.state,
            primaryLanguage: values.primaryLanguage,
            pronouns: values.pronouns,
          },
        },
      });
      const errorsResp = data?.updateChildInfo?.errors;
      if (errorsResp?.length) {
        setServerError(errorsResp[0]);
        setAutosaveStatus("error");
        return;
      }
      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus("idle"), 1200);
    } catch {
      setServerError("Unable to save child info right now. Please try again.");
      setAutosaveStatus("error");
    }
  };

  const watched = watch();
  useEffect(() => {
    if (!initialized.current || !referralId) return;
    if (!isDirty) return;
    const handle = setTimeout(() => {
      void saveChildInfo(watched);
    }, 700);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId, JSON.stringify(watched), isDirty]);

  const onSubmit = async (values: ChildForm) => {
    if (!validateDobOrAge(values)) return;
    await saveChildInfo(values);
    const next = getNextStep("child-info");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const goBack = () => {
    const prev = getPreviousStep("child-info");
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
        currentStep="child-info"
        onStepSelect={(target) =>
          target === "child-info"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step 2 of 9</p>
            <h2>About your child</h2>
            <p className="muted">This helps us tailor support to your child’s context.</p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
          </div>
        </div>

        {serverError ? <ValidationError message={serverError} /> : null}

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Child information form">
          <TextInput
            id="name"
            label="Child name"
            required
            error={errors.name?.message}
            {...register("name", { required: "Child name is required" })}
          />

          <TextInput
            id="dob"
            label="Date of birth"
            type="date"
            error={errors.dob?.message}
            {...register("dob")}
          />

          <SelectInput
            id="ageBand"
            label="Age band (if no DOB)"
            options={ageBandOptions}
            error={errors.ageBand?.message}
            {...register("ageBand")}
          />

          <SelectInput
            id="grade"
            label="Grade"
            required
            options={gradeOptions}
            error={errors.grade?.message}
            {...register("grade", { required: "Grade is required" })}
          />

          <TextInput
            id="schoolName"
            label="School name"
            required
            helperText="If homeschooled or not enrolled, note that here."
            error={errors.schoolName?.message}
            {...register("schoolName", { required: "School name is required" })}
          />

          <TextInput
            id="district"
            label="District"
            required
            error={errors.district?.message}
            {...register("district", { required: "District is required" })}
          />

          <SelectInput
            id="state"
            label="State"
            options={stateOptions}
            error={errors.state?.message}
            {...register("state")}
          />

          <SelectInput
            id="primaryLanguage"
            label="Primary language (optional)"
            options={[
              { value: "", label: "Select..." },
              { value: "English", label: "English" },
              { value: "Spanish", label: "Spanish" },
              { value: "Other", label: "Other" },
            ]}
            {...register("primaryLanguage")}
          />

          <TextInput id="pronouns" label="Pronouns (optional)" {...register("pronouns")} />

          <SelectInput
            id="howHeard"
            label="How did you hear about Daybreak? (optional)"
            options={[
              { value: "", label: "Select..." },
              { value: "School", label: "School" },
              { value: "Friend", label: "Friend" },
              { value: "Online search", label: "Online search" },
              { value: "Other", label: "Other" },
            ]}
            {...register("howHeard")}
          />

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
          .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            row-gap: 10px;
            margin-top: 8px;
          }

          /* Reduce label-to-input spacing locally */
          .form-grid :global(.db-input-label) {
            margin-bottom: 4px;
          }

          /* Align icons/text consistently for selects and date inputs */
          .form-grid :global(.db-select),
          .form-grid :global(input[type="date"].db-input) {
            height: 46px;
            padding: 0 14px;
            font-size: 15px;
            background-position: right 12px center;
          }

          .form-grid :global(.db-select) {
            padding-right: 36px; /* space for dropdown arrow */
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 8px;
            grid-column: 1 / -1;
          }
        `}</style>
      </OnboardingWizard>
    </ProtectedRoute>
  );
}

