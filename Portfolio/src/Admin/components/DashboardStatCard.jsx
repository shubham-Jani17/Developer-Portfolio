import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const from = display;
    const to = value;
    const duration = 650;
    const start = performance.now();

    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

export default function DashboardStatCard({
  label,
  value,
  hint,
  accent = "cyan",
  children,
  loading,
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (loading) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [value, loading]);

  const accentRing =
    accent === "violet"
      ? "from-violet-500/40 via-cyan-500/20 to-transparent"
      : "from-cyan-500/45 via-violet-500/25 to-transparent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-background p-5 sm:p-6 transition-all duration-300 ${
        accent === "violet"
          ? "shadow-[0_10px_30px_rgba(0,0,0,0.6),_0_0_20px_rgba(157,76,221,0.14),_inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_30px_rgba(157,76,221,0.24),_inset_0_1px_1px_rgba(255,255,255,0.15)]"
          : "shadow-[0_10px_30px_rgba(0,0,0,0.6),_0_0_20px_rgba(0,229,255,0.14),_inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_30px_rgba(0,229,255,0.24),_inset_0_1px_1px_rgba(255,255,255,0.15)]"
      } hover:border-white/20`}
    >
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentRing} opacity-80`}
        animate={pulse ? { opacity: [0.5, 1, 0.65] } : { opacity: 0.65 }}
        transition={{ duration: 0.7 }}
      />
      <motion.div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <p className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={`font-display text-3xl sm:text-4xl font-bold mt-2 tabular-nums ${
            accent === "violet" ? "text-violet-300" : "text-cyan-300"
          }`}
        >
          {loading ? "—" : <AnimatedNumber value={value} />}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
        {children}
      </div>
    </motion.div>
  );
}
