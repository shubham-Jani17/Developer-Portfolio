export default function GlassCard({ children, className = "", as: Tag = "div" }) {
  return (
    <Tag
      className={`glass rounded-2xl md:rounded-3xl border border-border dark:border-white/10 bg-card/80 dark:bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
    >
      {children}
    </Tag>
  );
}
