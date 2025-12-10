import { useRouter } from "next/router";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ResourceForm from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  const router = useRouter();

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout title="Create resource" description="Add new parent-facing content">
        <div className="page">
          <ResourceForm
            onSuccess={() => router.push("/admin/resources")}
            onCancel={() => router.back()}
          />
        </div>
      </AdminLayout>
      <style jsx>{`
        .page {
          max-width: 720px;
          margin: 0 auto;
        }
      `}</style>
    </ProtectedRoute>
  );
}

