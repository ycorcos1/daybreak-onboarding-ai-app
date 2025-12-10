import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type ImageUploadProps = {
  referralId: string;
  fileType: "front" | "back";
  label: string;
  existingKey?: string | null;
  disabled?: boolean;
  onUploaded: (key: string) => Promise<void> | void;
};

type PresignResponse = {
  url: string;
  fields: Record<string, string>;
  key: string;
};

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];

export function ImageUpload({
  referralId,
  fileType,
  label,
  existingKey,
  disabled,
  onUploaded,
}: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const requestPresign = useCallback(
    async (file: File): Promise<PresignResponse> => {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace("/graphql", "") || "http://localhost:3001";

      const response = await fetch(`${apiBase}/api/v1/uploads/insurance/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          referral_id: referralId,
          file_type: fileType,
          content_type: file.type,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Unable to start upload");
      }

      return response.json();
    },
    [fileType, referralId],
  );

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file || disabled) return;

      setError("");
      setStatus("idle");

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload a JPG, PNG, or HEIC image.");
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      setStatus("uploading");
      setProgress(0);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        const presign = await requestPresign(file);
        const formData = new FormData();
        Object.entries(presign.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", presign.url, true);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100);
              setProgress(pct);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(formData);
        });

        await onUploaded(presign.key);
        setStatus("success");
        setProgress(100);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [disabled, onUploaded, requestPresign],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    void handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  };

  const onSelectClick = () => inputRef.current?.click();

  return (
    <div
      className={`upload-card ${disabled ? "disabled" : ""}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="upload-header">
        <p className="upload-label">{label}</p>
        <Button variant="ghost" size="sm" onClick={onSelectClick} disabled={disabled}>
          {existingKey || previewUrl ? "Replace" : "Upload"}
        </Button>
      </div>

      <div className="upload-body" role="group" aria-label={label}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={onInputChange}
          disabled={disabled}
        />

        <div className="dropzone" onClick={onSelectClick}>
          {previewUrl ? (
            <img src={previewUrl} alt={`${label} preview`} className="preview" />
          ) : existingKey ? (
            <div className="uploaded-chip">Card uploaded</div>
          ) : (
            <div className="placeholder">
              <p>Drag & drop or click to upload</p>
              <p className="hint">JPG, PNG, or HEIC. Max {MAX_SIZE_MB}MB.</p>
            </div>
          )}
        </div>

        <div className="status" aria-live="polite">
          {status === "uploading" && `Uploading… ${progress}%`}
          {status === "success" && "Uploaded"}
          {status === "error" && error}
          {status === "idle" && error}
        </div>
      </div>

      <style jsx>{`
        .upload-card {
          border: 1px dashed var(--color-border);
          border-radius: 14px;
          padding: 12px;
          background: #fffaf6;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upload-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .upload-label {
          margin: 0;
          font-weight: 700;
          color: var(--color-deep-aqua);
        }

        .upload-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dropzone {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          background: #fff;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 12px;
          cursor: pointer;
        }

        .placeholder p {
          margin: 0;
        }

        .hint {
          color: var(--color-muted);
          font-size: 13px;
        }

        .preview {
          max-height: 160px;
          border-radius: 10px;
          object-fit: contain;
        }

        .uploaded-chip {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(0, 150, 168, 0.12);
          color: var(--color-deep-aqua);
          font-weight: 600;
        }

        .status {
          font-weight: 600;
          color: var(--color-muted);
          min-height: 20px;
        }
      `}</style>
    </div>
  );
}

export default ImageUpload;

