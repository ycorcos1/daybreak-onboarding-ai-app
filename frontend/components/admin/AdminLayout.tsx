import Link from "next/link";
import { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION } from "@/lib/graphql/mutations/auth.graphql";
import { useAuth } from "@/lib/auth/AuthContext";
import Button from "@/components/ui/Button";

type AdminLayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const router = useRouter();
  const { currentUser, refetchUser } = useAuth();
  const [logout] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    await logout();
    await refetchUser();
    await router.push("/auth/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="brand">
          <Link href="/admin/referrals" className="brand-link">
            Daybreak Admin
          </Link>
          <nav className="nav">
            <Link href="/admin/referrals" className="nav-link">
              Referrals
            </Link>
            <Link href="/admin/resources" className="nav-link">
              Resources
            </Link>
            <Link href="/admin/chats" className="nav-link">
              Chats
            </Link>
          </nav>
        </div>
        <div className="header-actions">
          <span className="user-pill">
            {currentUser?.name || "Admin"} · {currentUser?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
            Log out
          </Button>
        </div>
      </header>

      <main className="admin-content">
        {(title || description) && (
          <div className="page-header">
            {title ? <h1>{title}</h1> : null}
            {description ? <p className="muted">{description}</p> : null}
          </div>
        )}
        {children}
      </main>

      <style jsx>{`
        .admin-shell {
          min-height: 100vh;
          background: var(--color-soft-cream);
        }

        .admin-header {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: rgba(255, 244, 236, 0.95);
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(6px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand-link {
          font-weight: 700;
          font-size: 18px;
          color: var(--color-deep-aqua);
        }

        .nav {
          display: inline-flex;
          gap: 12px;
          align-items: center;
        }

        .nav-link {
          color: var(--color-text);
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .user-pill {
          background: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 600;
          color: var(--color-text);
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px 64px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .page-header h1 {
          margin: 0;
          color: var(--color-deep-aqua);
        }

        .muted {
          color: var(--color-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;


