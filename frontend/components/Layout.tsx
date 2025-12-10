import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { PropsWithChildren, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION } from "@/lib/graphql/mutations/auth.graphql";
import { useAuth } from "@/lib/auth/AuthContext";
import Button from "./ui/Button";

export function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { currentUser, loading, refetchUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logout] = useMutation(LOGOUT_MUTATION);

  const isAdminRoute = router.pathname.startsWith("/admin");

  const handleLogout = async () => {
    await logout();
    await refetchUser();
    await router.push("/");
    setMobileOpen(false);
  };

  const showDashboardLink = Boolean(currentUser) && router.pathname === "/";

  const navLinks = currentUser
    ? [
        ...(showDashboardLink ? [{ href: "/parent/dashboard", label: "Dashboard" }] : []),
        { href: "/parent/resources", label: "Resources" },
      ]
    : [];

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="layout">
        <header className="header">
          <Link href={currentUser ? "/parent/dashboard" : "/"} className="brand">
            <Image src="/logo.svg" alt="Daybreak" width={220} height={42} priority />
          </Link>
          <nav className={`nav ${mobileOpen ? "nav-open" : ""}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!loading && currentUser ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="logout-btn">
                Log Out
              </Button>
            ) : (
              <div className="auth-actions">
                <Link
                  href="/auth/signup"
                  className="auth-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    void router.push("/auth/login");
                    setMobileOpen(false);
                  }}
                >
                  Log In
                </Button>
              </div>
            )}
          </nav>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            ☰
          </button>
        </header>
        <main className="content">{children}</main>
        <footer className="footer">
          <div className="footer-links">
            <Link href="/terms">Terms of Use</Link>
            <span aria-hidden="true">•</span>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Daybreak</p>
        </footer>
      </div>
      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--color-soft-cream);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          position: sticky;
          top: 0;
          background: rgba(255, 244, 236, 0.9);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid var(--color-border);
          z-index: 10;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 18px;
          color: var(--color-deep-aqua);
          text-decoration: none;
        }

        .brand-mark {
          color: var(--color-primary-teal);
          font-size: 18px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .auth-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .auth-link {
          color: var(--color-text);
          font-weight: 600;
        }

        .nav-link {
          color: var(--color-text);
          font-weight: 600;
        }

        .logout-btn {
          margin-left: 8px;
        }

        .mobile-toggle {
          display: none;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 18px;
          cursor: pointer;
          color: var(--color-text);
        }

        .content {
          flex: 1;
          width: 100%;
        }

        .footer {
          padding: 24px 22px;
          border-top: 1px solid var(--color-border);
          color: var(--color-muted);
          font-size: 14px;
          background: var(--color-warm-beige);
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .nav {
            position: absolute;
            top: 70px;
            right: 16px;
            background: #ffffff;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            padding: 12px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            box-shadow: var(--shadow-soft);
            display: ${mobileOpen ? "flex" : "none"};
          }

          .mobile-toggle {
            display: inline-block;
          }
        }
      `}</style>
    </>
  );
}

export default Layout;
