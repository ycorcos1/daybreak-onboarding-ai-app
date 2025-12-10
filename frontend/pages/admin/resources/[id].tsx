import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ResourceForm from "@/components/admin/ResourceForm";
import Button from "@/components/ui/Button";
import { ADMIN_RESOURCE_QUERY } from "@/lib/graphql/queries/resources";
import { DELETE_RESOURCE_ITEM } from "@/lib/graphql/mutations/resources";

type AdminResourceResult = {
  adminResource: {
    id: string;
    title: string;
    body?: string | null;
    url?: string | null;
    resourceType: string;
    tags: string[];
    published: boolean;
  } | null;
};

export default function EditResourcePage() {
  const router = useRouter();
  const { id } = router.query;
  const resourceId = typeof id === "string" ? id : undefined;

  const { data, loading, error } = useQuery<AdminResourceResult>(ADMIN_RESOURCE_QUERY, {
    variables: { id: resourceId },
    skip: !resourceId,
  });

  const [deleteResource, { loading: deleting }] = useMutation(DELETE_RESOURCE_ITEM, {
    onCompleted: () => router.push("/admin/resources"),
  });

  const resource = data?.adminResource;

  const handleDelete = async () => {
    if (!resource) return;
    const confirmed = window.confirm("Delete this resource? This cannot be undone.");
    if (!confirmed) return;
    if (!resourceId) return;
    await deleteResource({ variables: { id: resourceId } });
  };

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout title="Edit resource">
        <div className="page">
          {loading && <p className="muted">Loading resource…</p>}
          {error && <p className="error">Unable to load resource.</p>}
          {!loading && !error && !resource ? <p>Resource not found.</p> : null}

          {resource ? (
            <>
              <div className="actions">
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/resources")}>
                  Back to list
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void handleDelete()} disabled={deleting}>
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
              <ResourceForm
                initialValue={{
                  id: resource.id,
                  title: resource.title,
                  body: resource.body,
                  url: resource.url,
                  resourceType: resource.resourceType,
                  tags: resource.tags,
                  published: resource.published,
                }}
                onSuccess={() => router.push("/admin/resources")}
                onCancel={() => router.push("/admin/resources")}
              />
            </>
          ) : null}
        </div>

        <style jsx>{`
          .page {
            max-width: 720px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .actions {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
          }

          .muted {
            color: var(--color-muted);
          }

          .error {
            color: var(--color-accent-red);
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

