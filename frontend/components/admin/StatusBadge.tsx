type StatusBadgeProps = {
  status: string;
};

const statusColors: Record<string, string> = {
  draft: "var(--color-muted)",
  submitted: "var(--color-primary-teal)",
  in_review: "#d17a00",
  ready_to_schedule: "#b65c00",
  scheduled: "#1c8554",
  closed: "#4a5568",
  withdrawn: "#9b2c2c",
  deleted: "#9b2c2c",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase?.() ?? "draft";
  const color = statusColors[normalized] || "var(--color-text)";
  const label = normalized.replace(/_/g, " ");

  return (
    <>
      <span className="status-pill" aria-label={`Status: ${label}`}>
        {label}
      </span>
      <style jsx>{`
        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.04);
          color: ${color};
          font-weight: 700;
          text-transform: capitalize;
        }
      `}</style>
    </>
  );
}

export default StatusBadge;


