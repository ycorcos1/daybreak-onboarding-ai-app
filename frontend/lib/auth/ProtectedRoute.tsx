import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import useCurrentUser from "./useCurrentUser";

type ProtectedRouteProps = {
  children: ReactNode;
  requireRole?: "parent" | "admin";
};

export function ProtectedRoute({
  children,
  requireRole = "parent",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { currentUser, loading } = useCurrentUser();

  const normalizedRole =
    currentUser?.role && typeof currentUser.role === "string"
      ? currentUser.role.toLowerCase()
      : undefined;

  useEffect(() => {
    if (!router.isReady || loading) return;

    const targetForRole =
      normalizedRole === "admin" ? "/admin/referrals" : "/parent/dashboard";

    if (!currentUser) {
      if (router.asPath !== "/auth/login") {
      void router.replace("/auth/login");
    }
      return;
    }

    if (requireRole && normalizedRole !== requireRole) {
      if (router.asPath !== targetForRole) {
        void router.replace(targetForRole);
      }
      return;
    }
  }, [currentUser, loading, normalizedRole, requireRole, router, router.isReady]);

  const roleMismatch =
    !loading && currentUser && requireRole && normalizedRole !== requireRole;

  if (loading || !router.isReady) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        Redirecting to login…
      </div>
    );
  }

  if (roleMismatch) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;

