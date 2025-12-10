import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import useReferral from "@/hooks/useReferral";
import { getNextStep } from "@/lib/onboardingSteps";
import { UPDATE_PARENT_INFO } from "@/lib/graphql/mutations/referrals.graphql";
import TextInput from "@/components/forms/TextInput";
import PhoneInput from "@/components/forms/PhoneInput";
import SelectInput from "@/components/forms/SelectInput";
import ValidationError from "@/components/forms/ValidationError";

type ParentInfoForm = {
  name: string;
  relationshipToChild: string;
  email: string;
  phone: string;
  address: string;
  languagePreference: string;
};

export default function ParentInfoStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const { referral, loading, error } = useReferral(referralId);
  const [updateParentInfo] = useMutation(UPDATE_PARENT_INFO);
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
  } = useForm<ParentInfoForm>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      relationshipToChild: "",
      email: "",
      phone: "",
      address: "",
      languagePreference: "",
    },
  });

  useEffect(() => {
    if (!referral) return;
    reset({
      name: referral.user?.name ?? "",
      relationshipToChild: referral.user?.relationshipToChild ?? "",
      email: referral.user?.email ?? "",
      phone: referral.user?.phone ?? "",
      address: referral.user?.address ?? "",
      languagePreference: referral.user?.languagePreference ?? "",
    });
    initialized.current = true;
  }, [referral, reset]);

  const saveParentInfo = async (values: ParentInfoForm) => {
    if (!referralId) return;
    setServerError("");
    setAutosaveStatus("saving");
    try {
      const { data } = await updateParentInfo({
        variables: {
          referralId,
          parentInfo: {
            name: values.name,
            phone: values.phone,
            address: values.address,
            languagePreference: values.languagePreference,
            relationshipToChild: values.relationshipToChild,
          },
        },
      });

      const errorsResp = data?.updateParentInfo?.errors;
      if (errorsResp?.length) {
        setServerError(errorsResp[0]);
        setAutosaveStatus("error");
        return;
      }

      setAutosaveStatus("saved");
      setTimeout(() => setAutosaveStatus("idle"), 1200);
    } catch {
      setServerError("Unable to save your info right now. Please try again.");
      setAutosaveStatus("error");
    }
  };

  const watchedValues = watch();

  useEffect(() => {
    if (!initialized.current || !referralId) return;
    if (!isDirty) return;
    const handle = setTimeout(() => {
      void saveParentInfo({ ...watchedValues, email: watchedValues.email });
    }, 700);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId, JSON.stringify(watchedValues), isDirty]);

  const onSubmit = async (values: ParentInfoForm) => {
    await saveParentInfo(values);
    const next = getNextStep("parent-info");
    void router.push(`/parent/referrals/${referralId}/onboarding/${next}`);
  };

  const goBack = () => {
    void router.push("/parent/dashboard");
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
        currentStep="parent-info"
        onStepSelect={(target) =>
          target === "parent-info"
            ? undefined
            : void router.push(`/parent/referrals/${referral.id}/onboarding/${target}`)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step 1 of 9</p>
            <h2>About you</h2>
            <p className="muted">
              We’ll use your contact information to coordinate care and keep you updated. Your answers
              save automatically.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Save error"}
          </div>
        </div>

        {serverError ? <ValidationError message={serverError} /> : null}

        <form
          className="form-grid"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Parent information form"
        >
          <TextInput
            id="name"
            label="Full name"
            required
            error={errors.name?.message}
            {...register("name", { required: "Your name is required" })}
          />

          <SelectInput
            id="relationshipToChild"
            label="Relationship to child"
            required
            error={errors.relationshipToChild?.message}
            {...register("relationshipToChild", {
              required: "Relationship is required",
            })}
            options={[
              { value: "Parent", label: "Parent" },
              { value: "Legal guardian", label: "Legal guardian" },
              { value: "Grandparent", label: "Grandparent" },
              { value: "Other", label: "Other" },
            ]}
          />

          <TextInput
            id="email"
            label="Email"
            type="email"
            required
            disabled
            helperText="Email comes from your account and can be updated in settings."
            {...register("email")}
          />

          <PhoneInput
            id="phone"
            label="Phone number"
            required
            value={watch("phone")}
            onChange={(val) => setValue("phone", val, { shouldValidate: true })}
            onBlur={() => void saveParentInfo({ ...watch(), phone: watch("phone") })}
            error={errors.phone?.message}
            helperText="We’ll use this to coordinate next steps."
          />

          <TextInput
            id="address"
            label="Home address (optional)"
            placeholder="Street, city, state"
            error={errors.address?.message}
            {...register("address")}
          />

          <SelectInput
            id="languagePreference"
            label="Language preference (optional)"
            options={[
              { value: "", label: "Select..." },
              { value: "English", label: "English" },
              { value: "Spanish", label: "Spanish" },
              { value: "Other", label: "Other" },
            ]}
            {...register("languagePreference")}
          />

          <div className="actions">
            <Button type="button" variant="ghost" onClick={goBack}>
              Save & exit
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

