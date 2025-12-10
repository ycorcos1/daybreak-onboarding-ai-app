import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const processCards = [
  {
    title: "Describe what’s happening",
    body: "Share your concerns in your own words. Our AI screener keeps the tone warm and non-judgmental.",
  },
  {
    title: "Share key details",
    body: "We’ll guide you through child info, clinical context, insurance, and scheduling preferences.",
  },
  {
    title: "Understand costs & next steps",
    body: "See a simple, non-binding cost estimate and what to expect after you submit your referral.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Parent onboarding for Daybreak Health</p>
          <h1>Take the first step in getting support for your child.</h1>
          <p className="hero-body">
            A calm, guided experience to help you share what’s going on, upload
            insurance details, and request a good time for the first session.
          </p>
          <ul className="hero-list">
            <li>Warm, plain-language guidance at every step</li>
            <li>Secure, account-based experience built for parents</li>
            <li>Not for emergencies and not a diagnosis</li>
          </ul>
          <div className="cta-row">
            <Button onClick={() => router.push("/auth/signup")}>
              Get Started
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/login")}
              className="cta-secondary"
            >
              Log In
            </Button>
          </div>
        </div>
        <div className="hero-card">
          <Card padding="24px">
            <p className="card-heading">What to expect</p>
            <p className="card-body">
              You’ll create an account, share what’s happening, upload insurance
              (optional), and pick times that work. We’ll review and follow up
              with clear next steps.
            </p>
            <div className="pill">
              <span aria-hidden="true">•</span> Takes about 15 minutes
            </div>
            <div className="pill pill-secondary">
              <span aria-hidden="true">•</span> One referral per child at a time
            </div>
          </Card>
        </div>
      </section>

      <section className="process">
        <h2>How this works</h2>
        <div className="process-grid">
          {processCards.map((card) => (
            <Card key={card.title} className="process-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="disclaimer">
        <Card padding="20px" className="disclaimer-card">
          <p className="disclaimer-title">Safety first</p>
          <p className="disclaimer-body">
            This microsite is not for emergencies and does not provide a
            diagnosis. If you or your child are in crisis, please call 911 or go
            to the nearest emergency room.
          </p>
        </Card>
      </section>

      <style jsx>{`
        .landing {
          padding: 48px 18px 64px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 28px;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 36px;
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }

        .hero-body {
          font-size: 17px;
          color: var(--color-text);
          margin-bottom: 12px;
        }

        .hero-list {
          margin: 0 0 18px;
          color: var(--color-text);
        }

        .cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cta-secondary {
          color: var(--color-primary-teal);
        }

        .hero-card {
          width: 100%;
        }

        .card-heading {
          color: var(--color-deep-aqua);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .card-body {
          color: var(--color-text);
          margin-bottom: 12px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(0, 150, 168, 0.08);
          color: var(--color-deep-aqua);
          font-weight: 600;
          margin-right: 8px;
        }

        .pill-secondary {
          background: rgba(244, 166, 28, 0.12);
          color: var(--color-secondary-gold);
        }

        .process {
          margin-top: 48px;
        }

        .process h2 {
          font-size: 26px;
          margin-bottom: 16px;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .process-card h3 {
          margin-bottom: 6px;
        }

        .process-card p {
          color: var(--color-text);
        }

        .disclaimer {
          margin-top: 36px;
        }

        .disclaimer-card {
          background: #fff;
        }

        .disclaimer-title {
          color: var(--color-accent-red);
          font-weight: 700;
          margin-bottom: 6px;
        }

        .disclaimer-body {
          color: var(--color-text);
          margin: 0;
        }

        @media (max-width: 640px) {
          .landing {
            padding: 32px 14px 48px;
          }

          .hero-text h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}
