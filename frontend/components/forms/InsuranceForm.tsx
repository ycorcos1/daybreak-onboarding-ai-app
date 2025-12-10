import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import TextInput from "@/components/forms/TextInput";
import PhoneInput from "@/components/forms/PhoneInput";

export type InsuranceFormValues = {
  insuranceStatus: string;
  insurerName?: string | null;
  planName?: string | null;
  memberId?: string | null;
  groupId?: string | null;
  policyholderName?: string | null;
  coveragePhone?: string | null;
  coverageWebsite?: string | null;
};

type InsuranceFormProps = {
  initialValues: InsuranceFormValues;
  onSubmit: (values: InsuranceFormValues) => Promise<void> | void;
  disabled?: boolean;
  saving?: boolean;
};

export function InsuranceForm({ initialValues, onSubmit, disabled, saving }: InsuranceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InsuranceFormValues>({
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="insurance-form" onSubmit={submit}>
      <div className="field-grid">
        <TextInput
          id="insurerName"
          label="Insurer name"
          placeholder="e.g., Blue Shield"
          disabled={disabled}
          error={errors.insurerName?.message}
          {...register("insurerName")}
          onBlur={() => void submit()}
        />
        <TextInput
          id="planName"
          label="Plan name"
          placeholder="Plan name"
          disabled={disabled}
          error={errors.planName?.message}
          {...register("planName")}
          onBlur={() => void submit()}
        />
        <TextInput
          id="memberId"
          label="Member ID"
          placeholder="Member ID"
          disabled={disabled}
          error={errors.memberId?.message}
          {...register("memberId")}
          onBlur={() => void submit()}
        />
        <TextInput
          id="groupId"
          label="Group ID"
          placeholder="Group ID"
          disabled={disabled}
          error={errors.groupId?.message}
          {...register("groupId")}
          onBlur={() => void submit()}
        />
        <TextInput
          id="policyholderName"
          label="Policyholder name"
          placeholder="Name on card"
          disabled={disabled}
          error={errors.policyholderName?.message}
          {...register("policyholderName")}
          onBlur={() => void submit()}
        />
        <Controller
          control={control}
          name="coveragePhone"
          render={({ field }) => (
            <PhoneInput
              id="coveragePhone"
              label="Coverage phone"
              placeholder="(555) 123-4567"
              disabled={disabled}
              error={errors.coveragePhone?.message}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={() => void submit()}
            />
          )}
        />
        <TextInput
          id="coverageWebsite"
          label="Coverage website"
          placeholder="https://insurer.example.com"
          disabled={disabled}
          error={errors.coverageWebsite?.message}
          {...register("coverageWebsite")}
          onBlur={() => void submit()}
        />
      </div>

      <div className="save-status" aria-live="polite">
        {(saving || isSubmitting) && "Saving..."}
      </div>

      <style jsx>{`
        .insurance-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .save-status {
          color: var(--color-muted);
          font-weight: 600;
          min-height: 20px;
        }
      `}</style>
    </form>
  );
}

export default InsuranceForm;

