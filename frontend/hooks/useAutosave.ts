import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_REFERRAL_STEP } from "@/lib/graphql/mutations/referrals.graphql";

type AutosaveArgs = {
  referralId?: string;
  stepName?: string;
  stepData?: Record<string, unknown>;
  enabled?: boolean;
};

export function useAutosave({
  referralId,
  stepName,
  stepData,
  enabled = true,
}: AutosaveArgs) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [updateReferralStep] = useMutation(UPDATE_REFERRAL_STEP);
  const latestPayload = useRef(stepData);

  useEffect(() => {
    latestPayload.current = stepData;
  }, [stepData]);

  const saveNow = async () => {
    if (!enabled || !referralId || !stepName) return;
    try {
      setStatus("saving");
      const response = await updateReferralStep({
        variables: {
          referralId,
          stepName,
          stepData: latestPayload.current,
        },
      });

      if (response.data?.updateReferralStep?.errors?.length) {
        setStatus("error");
        return;
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!enabled || !referralId || !stepName) return;
    const handle = setTimeout(() => {
      void saveNow();
    }, 600);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, referralId, stepName, JSON.stringify(stepData)]);

  return { status, saveNow };
}

export default useAutosave;


