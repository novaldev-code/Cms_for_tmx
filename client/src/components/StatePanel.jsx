export default function StatePanel({
  tone = 'neutral',
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div
      className={`state-panel state-panel--${tone}`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="actions">{action}</div> : null}
    </div>
  );
}
