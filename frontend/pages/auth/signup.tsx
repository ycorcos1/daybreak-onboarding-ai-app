import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PasswordInput from "@/components/ui/PasswordInput";
import TextInput from "@/components/ui/TextInput";
import { SIGNUP_MUTATION } from "@/lib/graphql/mutations/auth.graphql";
import { useAuth } from "@/lib/auth/AuthContext";

type SignupFormInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const [signup] = useMutation(SIGNUP_MUTATION);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, getValues, formState } = useForm<SignupFormInputs>({
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupFormInputs) => {
    setServerError("");
    try {
      const { data } = await signup({
        variables: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      });
      const result = data?.signupParent;
      if (result?.errors?.length) {
        setServerError(result.errors[0]);
        return;
      }
      if (result?.user) {
        await refetchUser();
        await router.push("/parent/dashboard");
        return;
      }
      setServerError("Unable to create your account. Please try again.");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <p className="eyebrow">Create your account</p>
        <h1 className="title">Let’s get started</h1>
        <p className="subtitle">
          We’ll help you share what’s happening and request a time that works for your family.
        </p>

        {serverError ? <div className="error-banner">{serverError}</div> : null}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <TextInput
            id="name"
            label="Full name"
            placeholder="Alex Smith"
            required
            error={formState.errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />
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
            placeholder="At least 8 characters"
            required
            error={formState.errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter your password"
            required
            error={formState.errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === getValues("password") || "Passwords must match",
            })}
          />
          <div className="actions">
            <Button type="submit" isFullWidth disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
            <button type="button" className="link-btn" onClick={() => router.push("/auth/login")}>
              Already have an account? Log in
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

        .link-btn:focus-visible {
          outline: 2px solid rgba(0, 150, 168, 0.4);
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
