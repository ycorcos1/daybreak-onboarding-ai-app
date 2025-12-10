import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ONBOARDING_STEPS, getNextStep } from "@/lib/onboardingSteps";

type ReferralSummary = {
  id: string;
  status: string;
  lastCompletedStep?: string | null;
  nextStep?: string | null;
  createdAt?: string;
  submittedAt?: string | null;
  child: {
    id: string;
    name: string;
    grade: string;
    schoolName: string;
    district: string;
  };
};

type ReferralListProps = {
  referrals: ReferralSummary[];
  onResume: (referralId: string, nextStep?: string | null) => void;
  onView?: (referralId: string) => void;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  ready_to_schedule: "Ready to schedule",
  scheduled: "Scheduled",
  closed: "Closed",
  withdrawn: "Withdrawn",
};

export function ReferralList({ referrals, onResume, onView }: ReferralListProps) {
  if (!referrals.length) {
    return (
      <Card className="empty-card">
        <h3>No referrals yet</h3>
        <p>Start a referral to begin onboarding for your child.</p>
      </Card>
    );
  }

  return (
    <div className="referral-grid">
      {referrals.map((referral) => {
        const statusKey =
          typeof referral.status === "string"
            ? referral.status.toLowerCase()
            : referral.status;
        const statusLabel =
          STATUS_LABELS[statusKey] ?? referral.status ?? "Unknown";
        const lastStep =
          referral.lastCompletedStep &&
          typeof referral.lastCompletedStep === "string"
            ? referral.lastCompletedStep.toLowerCase()
            : referral.lastCompletedStep || null;
        const safeNext =
          referral.nextStep ||
          (lastStep && ONBOARDING_STEPS.includes(lastStep)
            ? getNextStep(lastStep)
            : ONBOARDING_STEPS[0]);
        return (
          <Card key={referral.id} className="referral-card" padding="20px">
            <div className="referral-header">
              <div>
                <p className="referral-eyebrow">Child</p>
                <h3>{referral.child.name}</h3>
                <p className="meta">
                  Grade {referral.child.grade} · {referral.child.schoolName}
                </p>
              </div>
              <span className={`status ${statusKey}`}>
                {statusLabel}
              </span>
            </div>
            <p className="meta">
              District: {referral.child.district || "Not provided"}
            </p>
            <p className="meta">Last step: {lastStep || "Not started"}</p>
            <div className="actions">
              {statusKey === "draft" ? (
                <Button
                  size="sm"
                  onClick={() => onResume(referral.id, safeNext)}
                >
                  Resume onboarding
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onView ? onView(referral.id) : onResume(referral.id, "review")
                  }
                >
                  View details
                </Button>
              )}
            </div>
          </Card>
        );
      })}

      <style jsx>{`
        .referral-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 14px;
        }

        .referral-card {
          background: #fff;
        }

        .referral-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .referral-eyebrow {
          margin: 0;
          font-weight: 700;
          color: var(--color-primary-teal);
        }

        h3 {
          margin: 4px 0;
          color: var(--color-deep-aqua);
        }

        .meta {
          margin: 2px 0;
          color: var(--color-muted);
          font-size: 14px;
        }

        .status {
          border-radius: 999px;
          padding: 6px 12px;
          font-weight: 600;
          font-size: 13px;
          background: #eef2f5;
          color: var(--color-deep-aqua);
          border: 1px solid #d6dfe5;
        }

        .status.draft {
          background: #fff4ec;
          border-color: #ffd7b0;
          color: #b86800;
        }

        .status.submitted,
        .status.in_review,
        .status.ready_to_schedule {
          background: #e6f7fa;
          border-color: #b7e5ee;
          color: #007a8c;
        }

        .status.scheduled {
          background: #e9f8f1;
          border-color: #c5ecd9;
          color: #1c8554;
        }

        .status.withdrawn {
          background: #ffe9e9;
          border-color: #ffc2c2;
          color: #b30000;
        }

        .actions {
          margin-top: 12px;
        }

        .empty-card {
          background: #fff;
        }
      `}</style>
    </div>
  );
}

export default ReferralList;


