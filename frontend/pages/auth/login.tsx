import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PasswordInput from "@/components/ui/PasswordInput";
import TextInput from "@/components/ui/TextInput";
import { LOGIN_MUTATION } from "@/lib/graphql/mutations/auth.graphql";
import { useAuth } from "@/lib/auth/AuthContext";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginFormInputs>({
    mode: "onBlur",
  });
  const router = useRouter();
  const { refetchUser, currentUser, loading } = useAuth();
  const [login] = useMutation(LOGIN_MUTATION);
  const [serverError, setServerError] = useState("");

  // If already authenticated, send to dashboard
  useEffect(() => {
    if (!loading && currentUser) {
      const target =
        currentUser.role === "admin" ? "/admin/referrals" : "/parent/dashboard";
      if (router.asPath !== target) {
        void router.replace(target);
      }
    }
  }, [loading, currentUser, router]);

  const onSubmit = async (values: LoginFormInputs) => {
    setServerError("");
    try {
      const { data } = await login({
        variables: { email: values.email, password: values.password },
      });
      const result = data?.login;
      if (result?.errors?.length) {
        setServerError(result.errors[0]);
        return;
      }
      if (result?.user) {
        await refetchUser();
        await router.push("/parent/dashboard");
        return;
      }
      setServerError("Unable to log in. Please try again.");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1 className="title">Sign in to your account</h1>
        <p className="subtitle">
          This secure portal helps you start a referral for your child.
        </p>

        {serverError ? <div className="error-banner">{serverError}</div> : null}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <TextInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            error={formState.errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email",
              },
            })}
          />
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            required
            error={formState.errors.password?.message}
            {...register("password", {
              required: "Password is required",
            })}
          />
          <div className="actions">
            <Button type="submit" isFullWidth disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Signing in..." : "Log In"}
            </Button>
            <button
              type="button"
              className="link-btn"
              onClick={() => router.push("/auth/signup")}
            >
              Don&apos;t have an account? Sign up
            </button>
            <button type="button" className="link-btn muted">
              Forgot your password? (coming soon)
            </button>
          </div>
        </form>
      </Card>

      <style jsx>{`
        .auth-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          background: var(--color-soft-cream);
        }

        .auth-card {
          max-width: 440px;
          width: 100%;
          background: #fff;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        .title {
          margin: 0 0 6px;
          font-size: 26px;
        }

        .subtitle {
          color: var(--color-muted);
          margin: 0 0 16px;
        }

        .error-banner {
          background: rgba(255, 75, 75, 0.1);
          color: var(--color-accent-red);
          border: 1px solid var(--color-accent-red);
          padding: 10px 12px;
          border-radius: 12px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .link-btn {
          background: transparent;
          border: none;
          color: var(--color-primary-teal);
          font-weight: 600;
          text-align: left;
          padding: 4px 0;
          cursor: pointer;
        }

        .link-btn.muted {
          color: var(--color-muted);
        }

        .link-btn:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.4);
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}

