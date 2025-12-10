import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ADMIN_RESOURCES_QUERY } from "@/lib/graphql/queries/resources";

type ResourceItem = {
  id: string;
  title: string;
  resourceType: string;
  tags: string[];
  published: boolean;
  createdAt: string;
};

type AdminResourcesResult = {
  adminResources: ResourceItem[];
};

export default function AdminResourcesPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery<AdminResourcesResult>(
    ADMIN_RESOURCES_QUERY,
  );

  const resources = data?.adminResources ?? [];

  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayout title="Resources" description="Manage parent-facing content">
        <div className="page">
          <div className="header">
            <div>
              <p className="eyebrow">Content</p>
              <h1>Resources</h1>
              <p className="muted">
                Create, edit, publish, and unpublish resources shown to parents.
              </p>
            </div>
            <div className="header-actions">
              <Button variant="ghost" size="sm" onClick={() => void refetch()}>
                Refresh
              </Button>
              <Button onClick={() => router.push("/admin/resources/new")}>
                Create resource
              </Button>
            </div>
          </div>

          {loading && <p className="muted">Loading resources…</p>}
          {error && <p className="error">Unable to load resources.</p>}

          <div className="grid">
            {resources.map((resource) => (
              <Card key={resource.id} padding="16px" className="resource-card">
                <div className="card-header">
                  <div>
                    <p className="pill">{formatType(resource.resourceType)}</p>
                    <h3>{resource.title}</h3>
                  </div>
                  <span
                    className={`badge ${resource.published ? "badge--live" : "badge--draft"}`}
                  >
                    {resource.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="tags">
                  {resource.tags.map((tag) => (
                    <span key={`${resource.id}-${tag}`} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="muted small">
                  Created {new Date(resource.createdAt).toLocaleDateString()}
                </p>
                <div className="actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/resources/${resource.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <style jsx>{`
          .page {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .header-actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          h1 {
            margin: 4px 0;
            color: var(--color-deep-aqua);
          }

          .eyebrow {
            color: var(--color-primary-teal);
            font-weight: 700;
            margin: 0;
          }

          .muted {
            color: var(--color-muted);
            margin: 0;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 12px;
          }

          .resource-card {
            background: #fff;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 6px;
          }

          h3 {
            margin: 4px 0 0;
            color: var(--color-deep-aqua);
          }

          .pill {
            display: inline-flex;
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(0, 150, 168, 0.12);
            color: var(--color-deep-aqua);
            font-weight: 700;
            font-size: 12px;
            margin: 0;
          }

          .badge {
            padding: 4px 10px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 12px;
          }

          .badge--live {
            background: #d4edda;
            color: #155724;
          }

          .badge--draft {
            background: #f6f7f9;
            color: #6c757d;
          }

          .tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin: 6px 0;
          }

          .tag {
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
          }

          .small {
            font-size: 13px;
          }

          .actions {
            margin-top: 8px;
          }

          .error {
            color: var(--color-accent-red);
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function formatType(type?: string | null) {
  if (!type) return "Resource";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

