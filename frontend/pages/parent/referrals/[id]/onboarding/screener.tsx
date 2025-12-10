import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Button from "@/components/ui/Button";
import ValidationError from "@/components/forms/ValidationError";
import ScreenerChat, { ScreenerMessage } from "@/components/screener/ScreenerChat";
import useReferral from "@/hooks/useReferral";
import { getNextStep, getPreviousStep } from "@/lib/onboardingSteps";
import {
  APPEND_SCREENER_MESSAGE,
  COMPLETE_SCREENER,
  START_SCREENER_SESSION,
} from "@/lib/graphql/mutations/screener";
import { GET_SCREENER_SESSION } from "@/lib/graphql/queries/screener";

type ScreenerSession = {
  id: string;
  referralId: string;
  transcriptJsonb: ScreenerMessage[];
  summaryJsonb: Record<string, unknown>;
  riskFlag: boolean;
  completedAt?: string | null;
};

export default function ScreenerStep() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = useMemo(() => (id as string) || "", [id]);
  const startedSession = useRef(false);

  const { referral, loading: referralLoading, error: referralError } = useReferral(referralId);

  const {
    data: sessionData,
    loading: sessionLoading,
    refetch: refetchSession,
  } = useQuery<{ screenerSession: ScreenerSession | null }>(GET_SCREENER_SESSION, {
    variables: { referralId },
    skip: !referralId,
    fetchPolicy: "cache-and-network",
  });

  const [startSession, { loading: startLoading }] = useMutation(START_SCREENER_SESSION);
  const [appendMessage] = useMutation(APPEND_SCREENER_MESSAGE);
  const [completeScreener] = useMutation(COMPLETE_SCREENER);

  const [messages, setMessages] = useState<ScreenerMessage[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [isSending, setIsSending] = useState(false);

  const hydrateSession = (session: ScreenerSession | null | undefined) => {
    if (!session) return;
    const transcript = Array.isArray(session.transcriptJsonb) ? session.transcriptJsonb : [];
    setMessages(transcript);
    setSummary(session.summaryJsonb || {});
    setCompleted(Boolean(session.completedAt));
    const hasCrisisMessage = transcript.some((m) => m.crisis);
    setCrisisDetected(Boolean(session.riskFlag && hasCrisisMessage));
  };

  // Ensure a session exists and hydrate initial state
  useEffect(() => {
    if (!referralId || referralLoading) return;

    if (sessionData?.screenerSession) {
      hydrateSession(sessionData.screenerSession);
      return;
    }

    if (startedSession.current || sessionLoading) return;
    startedSession.current = true;

    void startSession({ variables: { referralId } })
      .then((res) => hydrateSession(res.data?.startScreenerSession?.session))
      .catch(() => setErrorBanner("Unable to start the screener right now. Please try again."));
  }, [referralId, referralLoading, sessionData, sessionLoading, startSession]);

  const handleSendMessage = async (text: string) => {
    if (!referralId) return;
    setErrorBanner("");
    const previousMessages = messages;
    setIsSending(true);
    setMessages([
      ...messages,
      {
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const { data } = await appendMessage({
        variables: { referralId, parentMessage: text },
      });
      const response = data?.appendScreenerMessage;
      if (response?.errors?.length) {
        setErrorBanner(response.errors[0]);
        setMessages(previousMessages);
        return;
      }

      hydrateSession(response?.session);
      setCrisisDetected(Boolean(response?.crisisDetected || response?.session?.riskFlag));
    } catch (e) {
      setErrorBanner("Unable to send your message right now. Please try again.");
      setMessages(previousMessages);
    } finally {
      setIsSending(false);
    }
  };

  const handleComplete = async () => {
    if (!referralId) return;
    setErrorBanner("");

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount < 3) {
      setErrorBanner("Please continue the conversation a bit more (at least 3 messages).");
      return;
    }

    try {
      const { data } = await completeScreener({ variables: { referralId } });
      const response = data?.completeScreener;
      if (response?.errors?.length) {
        setErrorBanner(response.errors[0]);
      }
      hydrateSession(response?.session);
      setCompleted(Boolean(response?.session?.completedAt));
      void refetchSession();
    } catch {
      setErrorBanner("Unable to finish the screener right now. Please try again.");
    }
  };

  const handleClearError = () => setErrorBanner("");

  const goToStep = (step: string) =>
    void router.push(`/parent/referrals/${referralId}/onboarding/${step}`);

  const handleNext = () => goToStep(getNextStep("screener"));
  const handleBack = () => goToStep(getPreviousStep("screener"));

  const summaryEntries = useMemo(() => summary || {}, [summary]);

  if (referralLoading || sessionLoading || startLoading) {
    return (
      <ProtectedRoute requireRole="parent">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>Loading screener…</div>
      </ProtectedRoute>
    );
  }

  if (referralError || !referral) {
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
        currentStep="screener"
        onStepSelect={(target) =>
          target === "screener" ? undefined : goToStep(target)
        }
      >
        <div className="step-header">
          <div>
            <p className="eyebrow">Step 3 of 9</p>
            <h2>AI Screener</h2>
            <p className="muted">
              Share what you’re seeing. The AI will ask brief follow-ups. Your conversation saves
              automatically.
            </p>
          </div>
          <div className="save-indicator" aria-live="polite">
            {isSending ? "Saving…" : completed ? "Completed" : "Draft"}
          </div>
        </div>

        {errorBanner ? <ValidationError message={errorBanner} /> : null}

        <ScreenerChat
          messages={messages}
          onSendMessage={handleSendMessage}
          onComplete={handleComplete}
          loading={isSending}
          disabled={false}
          crisisDetected={crisisDetected}
          completed={completed}
          error={null}
          onClearError={handleClearError}
        />

        {completed || Object.keys(summaryEntries).length ? (
          <div className="summary-card">
            <h3>What we heard</h3>
            <p className="muted">Here’s a quick recap based on your conversation.</p>
            <div className="summary-grid">
              {renderSummarySection("Presenting concerns", summaryEntries["presenting_concerns"])}
              {renderSummarySection("Symptom overview", summaryEntries["symptom_overview"])}
              {renderSummarySection("Context & triggers", summaryEntries["context_triggers"])}
              {renderSummarySection("Impact on functioning", summaryEntries["impact_on_functioning"])}
              {renderSummarySection("Parent goals", summaryEntries["parent_goals"])}
              {renderSummarySection("Communication preferences", summaryEntries["communication_preferences"])}
              {renderSummarySection("Risk flags", summaryEntries["risk_flags"])}
            </div>
          </div>
        ) : null}

        <div className="actions">
          <Button type="button" variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button type="button" onClick={handleNext} disabled={!completed}>
            Save & Continue
          </Button>
        </div>

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

          .summary-card {
            margin-top: 16px;
            padding: 16px;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            background: #f8fcfc;
          }

          .summary-card h3 {
            margin: 0 0 6px;
            color: var(--color-deep-aqua);
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 12px;
            margin-top: 10px;
          }

          .summary-section {
            border: 1px solid var(--color-border);
            border-radius: 10px;
            padding: 10px 12px;
            background: #fff;
          }

          .summary-section h4 {
            margin: 0 0 6px;
            color: var(--color-deep-aqua);
            font-size: 15px;
          }

          .summary-section ul {
            padding-left: 18px;
            margin: 4px 0;
          }

          .summary-section li {
            margin: 2px 0;
          }

          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 16px;
          }

          @media (max-width: 768px) {
            .summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </OnboardingWizard>
    </ProtectedRoute>
  );
}

function renderSummarySection(title: string, values: unknown) {
  const list = Array.isArray(values) ? values : [];
  if (!list.length) return null;

  return (
    <div className="summary-section">
      <h4>{title}</h4>
      <ul>
        {list.map((item, idx) => (
          <li key={`${title}-${idx}`}>{String(item)}</li>
        ))}
      </ul>
    </div>
  );
}


