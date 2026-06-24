import { motion } from "framer-motion";
import GradientTitle from "./GradientTitle";

export default function SectionHeader({ eyebrow, title, subtitle, className = "" }) {
  return (
    <motion.header
      className={`mb-8 sm:mb-10 md:mb-14 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15px" }}
      transition={{ duration: 0.35 }}
    >
      {eyebrow && (
        <p className="font-mono-display text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-cyan-400/80 mb-3 sm:mb-4">
          — {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.12] sm:leading-[1.1] text-foreground max-w-4xl text-balance">
          <GradientTitle parts={title} />
        </h2>
      )}
      {subtitle && (
        <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </motion.header>
  );
}
