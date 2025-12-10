import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ReferralDetail from "@/components/admin/ReferralDetail";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ADMIN_REFERRAL_QUERY } from "@/lib/graphql/queries/adminReferrals";

export default function AdminReferralDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const referralId = id as string;

  const { data, loading, error, refetch } = useQuery(ADMIN_REFERRAL_QUERY, {
    variables: { id: referralId },
    skip: !referralId,
    fetchPolicy: "cache-and-network",
  });

  const referral = data?.adminReferral;

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout
        title="Referral detail"
        description="Review packet, update status, approve deletion, and add notes."
      >
        {loading ? (
          <Card padding="18px">
            <p style={{ margin: 0 }}>Loading referral…</p>
          </Card>
        ) : null}

        {error ? (
          <Card padding="18px">
            <p style={{ margin: 0, color: "var(--color-accent-red)" }}>
              Unable to load this referral.
            </p>
            <Button variant="ghost" onClick={() => router.push("/admin/referrals")}>
              Back to list
            </Button>
          </Card>
        ) : null}

        {!loading && !error && !referral ? (
          <Card padding="18px">
            <p style={{ margin: 0 }}>Referral not found.</p>
            <Button variant="ghost" onClick={() => router.push("/admin/referrals")}>
              Back to list
            </Button>
          </Card>
        ) : null}

        {!loading && referral ? (
          <ReferralDetail referral={referral} onRefresh={() => void refetch()} />
        ) : null}
      </AdminLayout>
    </ProtectedRoute>
  );
}


