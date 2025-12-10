import { useQuery, type QueryHookOptions } from "@apollo/client";
import { REFERRAL_QUERY } from "@/lib/graphql/queries/referrals.graphql";

type ReferralQueryResult = {
  referral: {
    id: string;
    status: string;
    packetStatus?: string | null;
    deletionRequestedAt?: string | null;
    withdrawnAt?: string | null;
    createdAt?: string | null;
    riskFlag: boolean;
    lastCompletedStep?: string | null;
    lastUpdatedStepAt?: string | null;
    nextStep?: string | null;
    submittedAt?: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      address?: string | null;
      languagePreference?: string | null;
      relationshipToChild?: string | null;
    };
    child: {
      id: string;
      name: string;
      dob?: string | null;
      ageBand?: string | null;
      grade: string;
      schoolName: string;
      district: string;
      state?: string | null;
      primaryLanguage?: string | null;
      pronouns?: string | null;
    };
    insuranceDetail?: {
      id: string;
      insuranceStatus: string;
      insurerName?: string | null;
      planName?: string | null;
      memberId?: string | null;
      groupId?: string | null;
      policyholderName?: string | null;
      coveragePhone?: string | null;
      coverageWebsite?: string | null;
      source?: string | null;
    } | null;
    insuranceUploads: Array<{
      id: string;
      frontImageS3Key?: string | null;
      backImageS3Key?: string | null;
      ocrStatus?: string | null;
      ocrConfidence?: number | null;
      createdAt: string;
      updatedAt: string;
    }>;
    costEstimate?: {
      id: string;
      category?: string | null;
      ruleKey?: string | null;
      explanationText?: string | null;
      updatedAt: string;
    } | null;
    schedulingPreference?: {
      id: string;
      timezone?: string | null;
      locationPreference?: string | null;
      frequency?: string | null;
      clinicianPreferences?: Record<string, unknown>;
      windows: Array<Record<string, string>>;
      suggestedWindows: Array<Record<string, unknown>>;
    } | null;
    aiScreenerSession?: {
      id: string;
      summaryJsonb?: Record<string, unknown> | null;
      riskFlag: boolean;
    } | null;
    intakeResponse?: {
      id: string;
      responses: Record<string, unknown>;
    } | null;
    consentRecords: Array<{
      id: string;
      consentType: string;
      acceptedAt: string;
      ipAddress?: string | null;
      userAgent?: string | null;
    }>;
  } | null;
};

export function useReferral(
  referralId?: string,
  options?: QueryHookOptions<ReferralQueryResult>,
) {
  const { data, loading, error, refetch } = useQuery<ReferralQueryResult>(
    REFERRAL_QUERY,
    {
      variables: { id: referralId },
      skip: !referralId,
      fetchPolicy: "cache-and-network",
      ...options,
    },
  );

  return {
    referral: data?.referral ?? null,
    loading,
    error,
    refetch,
  };
}

export default useReferral;


