import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import ReferralList from "@/components/parent/ReferralList";
import { MY_REFERRALS_QUERY } from "@/lib/graphql/queries/referrals.graphql";
import { CREATE_CHILD_AND_REFERRAL } from "@/lib/graphql/mutations/referrals.graphql";
import { ONBOARDING_STEPS } from "@/lib/onboardingSteps";
import { MY_NOTIFICATIONS_QUERY } from "@/lib/graphql/queries/myNotifications";
import SupportChatWidget from "@/components/chat/SupportChatWidget";

type MyReferralsResult = {
  myReferrals: Array<{
    id: string;
    status: string;
    riskFlag: boolean;
    lastCompletedStep?: string | null;
    lastUpdatedStepAt?: string | null;
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
  }>;
};

type MyNotificationsResult = {
  myNotifications: Array<{
    id: string;
    readAt?: string | null;
  }>;
};

type ChildFormState = {
  name: string;
  grade: string;
  schoolName: string;
  district: string;
  dob: string;
};

const initialChildState: ChildFormState = {
  name: "",
  grade: "",
  schoolName: "",
  district: "",
  dob: "",
};

export default function ParentDashboard() {
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  const [childForm, setChildForm] = useState<ChildFormState>(initialChildState);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, loading: loadingReferrals, error: referralsError } =
    useQuery<MyReferralsResult>(MY_REFERRALS_QUERY);

  const { data: notificationsData } = useQuery<MyNotificationsResult>(
    MY_NOTIFICATIONS_QUERY,
    { variables: { unreadOnly: true } },
  );

  const [createChildAndReferral, { loading: creatingReferral }] = useMutation(
    CREATE_CHILD_AND_REFERRAL,
    {
      refetchQueries: [{ query: MY_REFERRALS_QUERY }],
    },
  );

  const referrals = useMemo(
    () => data?.myReferrals ?? [],
    [data?.myReferrals],
  );

  const onResume = (referralId: string, nextStep?: string | null) => {
    const targetStep =
      nextStep && ONBOARDING_STEPS.includes(nextStep)
        ? nextStep
        : ONBOARDING_STEPS[0];
    void router.push(`/parent/referrals/${referralId}/onboarding/${targetStep}`);
  };

  const onViewDetails = (referralId: string) => {
    void router.push(`/parent/referrals/${referralId}`);
  };

  const handleCreateReferral = async () => {
    setFormError(null);
    const missing = Object.entries(childForm).filter(
      ([, value]) => !value.trim(),
    );
    if (missing.length) {
      setFormError("Please complete all required fields.");
      return;
    }

    try {
      const response = await createChildAndReferral({
        variables: {
          childInput: {
            name: childForm.name,
            grade: childForm.grade,
            schoolName: childForm.schoolName,
            district: childForm.district,
            dob: childForm.dob,
          },
        },
      });

      const result = response.data?.createChildAndReferral;
      if (result?.errors?.length) {
        setFormError(result.errors.join(", "));
        return;
      }

      const referralId = result?.referral?.id;
      if (referralId) {
        setChildForm(initialChildState);
        void router.push(
          `/parent/referrals/${referralId}/onboarding/${ONBOARDING_STEPS[0]}`,
        );
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  };

  const unreadCount = notificationsData?.myNotifications?.length ?? 0;

  return (
    <ProtectedRoute requireRole="parent">
      <div className="dash">
        <div className="dash-header">
          <div>
            <p className="eyebrow">Welcome</p>
            <h1 className="title">Hi, {currentUser?.name || "there"}!</h1>
            <p className="subtitle">
              Start a referral, pick up where you left off, or review updates.
            </p>
          </div>
        </div>

        <div className="grid">
          <Card className="start-card">
            <h2>Start a referral</h2>
            <p className="muted">
              One referral per child. We’ll save your progress automatically.
            </p>
            <div className="form-grid">
              <TextInput
                id="child-dob"
                label="Date of birth"
                type="date"
                required
                value={childForm.dob}
                onChange={(e) =>
                  setChildForm((s) => ({ ...s, dob: e.target.value }))
                }
              />
              <TextInput
                id="child-name"
                label="Child name"
                required
                value={childForm.name}
                onChange={(e) =>
                  setChildForm((s) => ({ ...s, name: e.target.value }))
                }
              />
              <TextInput
                id="child-grade"
                label="Grade"
                required
                value={childForm.grade}
                onChange={(e) =>
                  setChildForm((s) => ({ ...s, grade: e.target.value }))
                }
              />
              <TextInput
                id="child-school"
                label="School name"
                required
                value={childForm.schoolName}
                onChange={(e) =>
                  setChildForm((s) => ({ ...s, schoolName: e.target.value }))
                }
              />
              <TextInput
                id="child-district"
                label="District"
                required
                value={childForm.district}
                onChange={(e) =>
                  setChildForm((s) => ({ ...s, district: e.target.value }))
                }
              />
            </div>
            {formError ? <p className="error-text">{formError}</p> : null}
            <div className="actions">
              <Button
                onClick={handleCreateReferral}
                disabled={creatingReferral}
                isFullWidth
              >
                {creatingReferral ? "Creating..." : "Start referral"}
              </Button>
            </div>
          </Card>

          <Card className="notifications">
            <div className="quick-row">
              <div>
                <h3>Notifications</h3>
                <p className="muted">
                  See updates on submissions, withdrawals, and requests.
                </p>
              </div>
              {unreadCount > 0 ? (
                <span className="badge">{unreadCount}</span>
              ) : null}
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/parent/notifications")}
              isFullWidth
            >
              View notifications
            </Button>
          </Card>

          <Card className="resources">
            <h3>Support resources</h3>
            <p className="muted">
              Articles, videos, and tools to help you and your child.
            </p>
            <Button
              variant="ghost"
              onClick={() => router.push("/parent/resources")}
              isFullWidth
            >
              Browse resources
            </Button>
          </Card>
        </div>

        <section className="referrals-section">
          <div className="referrals-header">
            <h2>Your referrals</h2>
            <p className="muted">
              Resume onboarding or review submitted referrals.
            </p>
          </div>
          {loadingReferrals && <p>Loading referrals…</p>}
          {referralsError && (
            <p className="error-text">
              Unable to load referrals. Please refresh.
            </p>
          )}
          {!loadingReferrals && !referralsError ? (
            <ReferralList
              referrals={referrals}
              onResume={onResume}
              onView={onViewDetails}
            />
          ) : null}
        </section>
      </div>
      <SupportChatWidget />
      <style jsx>{`
        .dash {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 18px 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        .title {
          margin: 0 0 6px;
        }

        .subtitle {
          color: var(--color-muted);
          margin: 0;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
          align-items: start;
        }

        .start-card,
        .notifications,
        .resources {
          background: #fff;
        }

        .muted {
          color: var(--color-muted);
          margin: 4px 0 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .actions {
          margin-top: 8px;
        }

        .error-text {
          color: var(--color-accent-red);
          margin: 6px 0;
        }

        .referrals-section {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quick-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          border-radius: 999px;
          background: #ff4b4b;
          color: #fff;
          font-weight: 700;
        }

        .referrals-header {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}

