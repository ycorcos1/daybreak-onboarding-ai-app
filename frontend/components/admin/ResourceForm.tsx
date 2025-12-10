import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import Button from "@/components/ui/Button";
import TextInput from "@/components/forms/TextInput";
import TextAreaInput from "@/components/forms/TextAreaInput";
import SelectInput from "@/components/forms/SelectInput";
import { CREATE_RESOURCE_ITEM, UPDATE_RESOURCE_ITEM } from "@/lib/graphql/mutations/resources";

type ResourceFormValues = {
  id?: string;
  title: string;
  body?: string | null;
  url?: string | null;
  resourceType: string;
  tags: string[];
  published: boolean;
};

type Props = {
  initialValue?: ResourceFormValues;
  onSuccess: () => void;
  onCancel?: () => void;
};

export default function ResourceForm({ initialValue, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [resourceType, setResourceType] = useState(initialValue?.resourceType ?? "article");
  const [body, setBody] = useState(initialValue?.body ?? "");
  const [url, setUrl] = useState(initialValue?.url ?? "");
  const [tags, setTags] = useState(initialValue?.tags?.join(", ") ?? "");
  const [published, setPublished] = useState(initialValue?.published ?? false);
  const [errors, setErrors] = useState<string[]>([]);

  const [createResource, { loading: creating }] = useMutation(CREATE_RESOURCE_ITEM);
  const [updateResource, { loading: updating }] = useMutation(UPDATE_RESOURCE_ITEM);

  const isEdit = useMemo(() => Boolean(initialValue?.id), [initialValue?.id]);
  const loading = creating || updating;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      title,
      resourceType,
      body: resourceType === "article" ? body : null,
      url: resourceType !== "article" ? url : null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published,
    };

    try {
      if (isEdit && initialValue?.id) {
        const { data } = await updateResource({
          variables: { id: initialValue.id, resourceInput: payload },
        });
        const mutationErrors = data?.updateResourceItem?.errors ?? [];
        if (mutationErrors.length) {
          setErrors(mutationErrors);
          return;
        }
      } else {
        const { data } = await createResource({
          variables: { resourceInput: payload },
        });
        const mutationErrors = data?.createResourceItem?.errors ?? [];
        if (mutationErrors.length) {
          setErrors(mutationErrors);
          return;
        }
      }

      onSuccess();
    } catch (err: any) {
      setErrors([err?.message || "Unable to save resource"]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="resource-form">
      {errors.length > 0 && (
        <div className="error-banner" role="alert">
          {errors.map((err, idx) => (
            <p key={idx}>{err}</p>
          ))}
        </div>
      )}

      <TextInput
        id="resource-title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <SelectInput
        id="resource-type"
        label="Type"
        value={resourceType}
        onChange={(e) => setResourceType(e.target.value)}
        required
        options={[
          { value: "article", label: "Article" },
          { value: "video", label: "Video" },
          { value: "interactive", label: "Interactive" },
        ]}
      />

      {resourceType === "article" ? (
        <TextAreaInput
          id="resource-body"
          label="Body"
          value={body || ""}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          required
        />
      ) : (
        <TextInput
          id="resource-url"
          label="URL"
          value={url || ""}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      )}

      <TextInput
        id="resource-tags"
        label="Tags"
        helperText="Comma-separated tags (e.g., anxiety, insurance)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span>Published (visible to parents)</span>
      </label>

      <div className="actions">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update resource" : "Create resource"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>

      <style jsx>{`
        .resource-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .error-banner {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 10px;
          padding: 12px;
        }

        .checkbox {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--color-text);
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
      `}</style>
    </form>
  );
}

