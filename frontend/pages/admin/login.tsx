import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import Card from "@/components/ui/Card";
import TextInput from "@/components/ui/TextInput";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { LOGIN_MUTATION, LOGOUT_MUTATION } from "@/lib/graphql/mutations/auth.graphql";
import { useAuth } from "@/lib/auth/AuthContext";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentUser, loading, refetchUser } = useAuth();
  const [login] = useMutation(LOGIN_MUTATION);
  const [logout] = useMutation(LOGOUT_MUTATION);
  const [form, setForm] = useState<LoginFormInputs>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !currentUser) return;
    if (currentUser.role === "admin") {
      void router.replace("/admin/referrals");
    } else {
      void router.replace("/parent/dashboard");
    }
  }, [currentUser, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await login({
        variables: { email: form.email, password: form.password },
      });
      const result = data?.login;
      if (result?.errors?.length) {
        setError(result.errors[0]);
        setSubmitting(false);
        return;
      }

      const role = result?.user?.role;
      await refetchUser();

      if (role !== "admin") {
        setError("Admin access only. Please sign in with an admin account.");
        await logout();
        setSubmitting(false);
        return;
      }

      await router.push("/admin/referrals");
    } catch (err) {
      setError("Unable to log in right now. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <p className="eyebrow">Admin console</p>
        <h1 className="title">Sign in as admin</h1>
        <p className="subtitle">Secure access for Daybreak operators.</p>

        {error ? <div className="error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <TextInput
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <PasswordInput
            id="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <Button type="submit" isFullWidth disabled={submitting}>
            {submitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
      </Card>

      <style jsx>{`
        .auth-page {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          background: var(--color-soft-cream);
        }

        .auth-card {
          max-width: 420px;
          width: 100%;
          background: #fff;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        .title {
          margin: 0 0 4px;
          color: var(--color-deep-aqua);
        }

        .subtitle {
          margin: 0 0 12px;
          color: var(--color-muted);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .error-banner {
          background: #ffe9e9;
          color: #b30000;
          border: 1px solid #b30000;
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 700;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}


