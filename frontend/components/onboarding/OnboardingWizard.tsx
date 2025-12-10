import { ReactNode } from "react";
import Card from "@/components/ui/Card";
import { ONBOARDING_STEPS, STEP_LABELS } from "@/lib/onboardingSteps";
import SupportChatWidget from "@/components/chat/SupportChatWidget";

type OnboardingWizardProps = {
  referralId: string;
  currentStep: string;
  onStepSelect?: (step: string) => void;
  children: ReactNode;
};

export function OnboardingWizard({
  referralId,
  currentStep,
  onStepSelect,
  children,
}: OnboardingWizardProps) {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

  return (
    <div className="wizard-shell">
      <header className="wizard-header">
        <div>
          <p className="wizard-eyebrow">Referral #{referralId}</p>
          <h1 className="wizard-title">Onboarding</h1>
          <p className="wizard-subtitle">
            Complete each step to submit your referral. Your answers save
            automatically.
          </p>
        </div>
      </header>

      <Card padding="20px" className="wizard-progress">
        <ol className="step-list">
          {ONBOARDING_STEPS.map((step, idx) => {
            const state =
              idx < currentIndex
                ? "done"
                : idx === currentIndex
                  ? "active"
                  : "upcoming";
            return (
              <li
                key={step}
                className={`step ${state}`}
                aria-current={state === "active" ? "step" : undefined}
              >
                <button
                  type="button"
                  className="step-button"
                  onClick={() => onStepSelect?.(step)}
                  disabled={state === "upcoming"}
                >
                  <span className="step-circle">{idx + 1}</span>
                  <span className="step-label">{STEP_LABELS[step]}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card padding="24px" className="wizard-body">
        {children}
      </Card>
      <SupportChatWidget referralId={referralId} />

      <style jsx>{`
        .wizard-shell {
          max-width: 1040px;
          margin: 0 auto;
          padding: 32px 18px 64px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wizard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .wizard-eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        .wizard-title {
          margin: 0 0 4px;
          color: var(--color-deep-aqua);
        }

        .wizard-subtitle {
          margin: 0;
          color: var(--color-muted);
          max-width: 720px;
        }

        .wizard-progress {
          overflow-x: auto;
        }

        .step-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 0;
          padding: 0;
        }

        .step {
          position: relative;
        }

        .step-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          transition: border-color 120ms ease, box-shadow 120ms ease,
            transform 120ms ease;
        }

        .step-button:disabled {
          cursor: not-allowed;
        }

        .step.done .step-button {
          border-color: var(--color-primary-teal);
          box-shadow: 0 6px 18px rgba(0, 150, 168, 0.14);
        }

        .step.active .step-button {
          border-color: var(--color-primary-teal);
          box-shadow: 0 8px 20px rgba(0, 150, 168, 0.16);
          transform: translateY(-1px);
        }

        .step.upcoming .step-button {
          background: #fdf8f3;
        }

        .step-circle {
          height: 32px;
          width: 32px;
          border-radius: 999px;
          background: #ffffff;
          border: 2px solid var(--color-border);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--color-deep-aqua);
        }

        .step.done .step-circle,
        .step.active .step-circle {
          border-color: var(--color-primary-teal);
          background: rgba(0, 150, 168, 0.12);
        }

        .step-label {
          font-weight: 600;
          color: var(--color-deep-aqua);
        }

        .wizard-body {
          background: #fff;
        }

        @media (max-width: 768px) {
          .wizard-shell {
            padding: 24px 14px 48px;
          }

          .step-list {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

export default OnboardingWizard;


