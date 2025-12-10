import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import ProtectedRoute from "@/lib/auth/ProtectedRoute";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RESOURCES_QUERY } from "@/lib/graphql/queries/resources";

type ResourceItem = {
  id: string;
  title: string;
  body?: string | null;
  url?: string | null;
  resourceType: string;
  tags: string[];
  createdAt: string;
};

type ResourcesQueryResult = {
  resources: ResourceItem[];
};

export default function ResourcesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<ResourcesQueryResult>(
    RESOURCES_QUERY,
    {
      variables: { tags: selectedTags.length ? selectedTags : undefined },
    },
  );

  const resources = data?.resources ?? [];

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    resources.forEach((res) => res.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [resources]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleRefetch = () => {
    void refetch({
      tags: selectedTags.length ? selectedTags : undefined,
    });
  };

  return (
    <ProtectedRoute requireRole="parent">
      <div className="page">
        <header className="header">
          <div>
            <p className="eyebrow">Resources</p>
            <h1>Support for you and your child</h1>
            <p className="muted">
              Articles, videos, and interactive tools curated by Daybreak.
            </p>
          </div>
          <div className="header-actions">
            <Button variant="ghost" onClick={handleRefetch}>
              Refresh
            </Button>
          </div>
        </header>

        {allTags.length ? (
          <div className="filters">
            <p className="muted">Filter by topic:</p>
            <div className="tag-row">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={`tag ${active ? "tag--active" : ""}`}
                    onClick={() => toggleTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {loading && <p className="muted">Loading resources…</p>}
        {error && (
          <p className="error-text">
            Unable to load resources. Please try again.
          </p>
        )}
        {!loading && !error && resources.length === 0 ? (
          <Card className="empty-card">
            <h3>No resources yet</h3>
            <p className="muted">
              Check back soon for articles, videos, and tools to support you.
            </p>
          </Card>
        ) : null}

        <div className="grid">
          {resources.map((resource) => {
            const isExpanded = expanded === resource.id;
            const isArticle = resource.resourceType === "article";
            const isVideo = resource.resourceType === "video";
            const isInteractive = resource.resourceType === "interactive";
            const showBody = isArticle && (isExpanded || (resource.body?.length || 0) <= 220);
            const excerpt =
              resource.body && resource.body.length > 220
                ? `${resource.body.slice(0, 220)}…`
                : resource.body;

            return (
              <Card key={resource.id} className="resource-card" padding="18px">
                <div className="card-header">
                  <div>
                    <p className="pill">{formatType(resource.resourceType)}</p>
                    <h3>{resource.title}</h3>
                  </div>
                  <div className="tags">
                    {resource.tags.map((tag) => (
                      <span key={`${resource.id}-${tag}`} className="tag tag--inline">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="muted">
                  {showBody ? resource.body : excerpt || "No description provided."}
                </p>
                <div className="actions">
                  {isArticle ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpanded((prev) => (prev === resource.id ? null : resource.id))
                      }
                    >
                      {isExpanded ? "Hide article" : "Read article"}
                    </Button>
                  ) : null}
                  {isVideo || isInteractive ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (resource.url) {
                          window.open(resource.url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      disabled={!resource.url}
                    >
                      {isVideo ? "Watch" : "Explore"}
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 18px 64px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: var(--color-primary-teal);
          font-weight: 700;
          margin: 0 0 6px;
        }

        h1 {
          margin: 0 0 6px;
          color: var(--color-deep-aqua);
        }

        .muted {
          color: var(--color-muted);
          margin: 0;
        }

        .filters {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tag-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          border: 1px solid var(--color-border);
          background: #fff;
          border-radius: 999px;
          padding: 6px 12px;
          cursor: pointer;
          color: var(--color-text);
        }

        .tag--active {
          background: rgba(0, 150, 168, 0.12);
          border-color: var(--color-primary-teal);
          color: var(--color-deep-aqua);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }

        .resource-card {
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .pill {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(0, 150, 168, 0.1);
          color: var(--color-deep-aqua);
          font-weight: 700;
          font-size: 13px;
          margin: 0 0 6px;
        }

        h3 {
          margin: 0;
          color: var(--color-deep-aqua);
        }

        .tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag--inline {
          background: #f6f7f9;
          border: 1px solid var(--color-border);
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 12px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .error-text {
          color: var(--color-accent-red);
          margin: 0;
        }

        .empty-card {
          background: #fff;
        }
      `}</style>
    </ProtectedRoute>
  );
}

function formatType(type?: string | null) {
  if (!type) return "Resource";
  return type.charAt(0).toUpperCase() + type.slice(1);
}


