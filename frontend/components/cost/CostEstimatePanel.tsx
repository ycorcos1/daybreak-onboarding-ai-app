import Card from "@/components/ui/Card";

type CostEstimate = {
  category?: string | null;
  ruleKey?: string | null;
  explanationText?: string | null;
};

type CostEstimatePanelProps = {
  costEstimate: CostEstimate | null | undefined;
  loading?: boolean;
  inputsHint?: string;
};

const DISCLAIMER =
  "This estimate is not a guarantee of coverage. Final determination will be made by Daybreak and your insurance provider.";

const HEADLINES: Record<string, string> = {
  no_cost: "You may have little or no out-of-pocket cost",
  copay: "You may have a copay for sessions",
  tbd: "We'll confirm your costs before your first session",
  unknown: "We're still reviewing your information",
};

export function CostEstimatePanel({ costEstimate, loading, inputsHint }: CostEstimatePanelProps) {
  const categoryKey = costEstimate?.category ?? "unknown";
  const headline = HEADLINES[categoryKey] || HEADLINES.unknown;
  const explanation = costEstimate?.explanationText || "We’ll confirm your costs once we review your information.";

  return (
    <Card padding="24px" className="cost-card">
      <div className="header">
        <p className="eyebrow">Cost estimate</p>
        {inputsHint ? <p className="hint">{inputsHint}</p> : null}
      </div>

      <h2 className="headline">{loading ? "Calculating your estimate…" : headline}</h2>
      <p className="body">{explanation}</p>

      <div className="disclaimer" role="note">
        {DISCLAIMER}
      </div>

      <style jsx>{`
        .cost-card {
          background: #fffaf6;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .eyebrow {
          margin: 0;
          color: var(--color-primary-teal);
          font-weight: 700;
        }

        .hint {
          margin: 0;
          color: var(--color-muted);
          font-weight: 600;
        }

        .headline {
          margin: 8px 0 8px;
          color: var(--color-deep-aqua);
        }

        .body {
          margin: 0 0 12px;
          color: #1f2a38;
          font-size: 16px;
          line-height: 1.6;
        }

        .disclaimer {
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: #ffffff;
          padding: 12px;
          color: var(--color-muted);
          font-weight: 600;
        }
      `}</style>
    </Card>
  );
}

export default CostEstimatePanel;

