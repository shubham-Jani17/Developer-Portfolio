/** Splits title config into plain + gradient-highlight spans */
export default function GradientTitle({ parts, className = "", highlightClassName = "text-gradient" }) {
  if (!parts) return null;
  const { before = "", highlight = "", after = "" } = parts;
  return (
    <span className={className}>
      {before}
      {highlight && <span className={highlightClassName}>{highlight}</span>}
      {after}
    </span>
  );
}
