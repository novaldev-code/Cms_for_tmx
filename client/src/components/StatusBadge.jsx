const LABELS = {
  published: 'Terbit',
  draft: 'Draf',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {LABELS[status] ?? status}
    </span>
  );
}
