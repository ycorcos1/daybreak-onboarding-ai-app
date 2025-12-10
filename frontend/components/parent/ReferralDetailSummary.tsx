import ReviewSummary from "@/components/onboarding/ReviewSummary";

type Props = {
  referral: any;
};

/**
 * Thin wrapper to render the existing ReviewSummary component in read-only mode.
 */
export default function ReferralDetailSummary({ referral }: Props) {
  return (
    <ReviewSummary
      referral={referral}
      missingSections={[]}
      onEditStep={() => {
        /* read-only */
      }}
      showEdit={false}
    />
  );
}


