import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext";
import ProxyErrorSymbol from "../Components/ProxyErrorSymbol";
import GlassCard from "../Components/GlassCard";

function TimelineEntry({ item, align }) {
  const isRight = align === "right";
  const xFrom = isRight ? 48 : -48;

  return (
    <motion.article
      className={`max-w-md ${isRight ? "md:text-left" : "md:text-right"} ${!isRight ? "md:ml-auto" : ""}`}
      initial={{ opacity: 0, x: xFrom }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
    >
      <p className="font-mono-display text-[11px] tracking-[0.2em] uppercase text-cyan-400/90">
        {item.period}
      </p>
      <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-2 tracking-tight">
        {item.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
      <p className="mt-4 text-sm sm:text-[15px] text-muted-foreground/90 leading-relaxed">
        {item.description}
      </p>
      <ul className={`mt-5 flex flex-wrap gap-2 ${isRight ? "md:justify-start" : "md:justify-end"}`}>
        {item.tech.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 font-mono-display text-[10px] tracking-wider text-foreground/75"
          >
            {tag}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function TimelineNode() {
  return (
    <div className="timeline-node relative z-10 flex h-4 w-4 shrink-0 items-center justify-center">
      <span className="absolute h-4 w-4 rounded-full bg-cyan-400/25" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
    </div>
  );
}

export default function Experience() {
  const { portfolio, fromApi } = usePortfolio();
  const { experienceSection } = portfolio;
  const experience = portfolio.experience ?? [];
  const { title } = experienceSection;

  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 65%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section
      id="experience"
      ref={containerRef}
      className="page-container section-pad relative"
    >
      <motion.header
        className="mb-10 sm:mb-14 md:mb-20 text-center md:text-left"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono-display text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-muted-foreground mb-3 sm:mb-4">
          {experienceSection.eyebrow}
        </p>
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.12] sm:leading-[1.1] max-w-3xl mx-auto md:mx-0 text-balance">
          {title.before}
          <span className="text-cyan-400">{title.craft}</span>
          {title.mid}
          <span className="text-gradient-violet">{title.growth}</span>
          {title.after}
        </h2>
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto md:mx-0">
          {experienceSection.subtitle}
        </p>
      </motion.header>

      {!fromApi ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <GlassCard className="flex flex-col items-center justify-center text-center p-10 py-16 border border-dashed border-white/10 hover:border-cyan-500/20 transition-all duration-300">
            <ProxyErrorSymbol />
            <h3 className="font-display text-2xl font-bold text-foreground">No items found!</h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Backend database is unreachable due to a proxy error.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="experience-timeline relative max-w-4xl mx-auto">
          <div className="timeline-spine hidden md:block" aria-hidden>
            <motion.div
              className="timeline-spine-fill"
              style={{ scaleY, transformOrigin: "top center" }}
            />
          </div>

          <div className="timeline-spine timeline-spine--mobile md:hidden" aria-hidden>
            <motion.div
              className="timeline-spine-fill"
              style={{ scaleY, transformOrigin: "top center" }}
            />
          </div>

          <ul className="relative space-y-10 sm:space-y-14 md:space-y-0">
            {experience.map((item, index) => {
              const isLeft = index % 2 === 0;

              return (
                <li
                  key={`${item.period}-${item.title}`}
                  className="experience-timeline-row relative md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-10 md:py-12 first:md:pt-0 last:md:pb-0"
                >
                  {/* Mobile: line + node on left */}
                  <div className="md:hidden absolute left-[7px] top-1.5">
                    <TimelineNode />
                  </div>

                  <div className="pl-8 md:pl-0 md:col-start-1 md:col-end-2 flex md:justify-end md:items-center min-h-[1px]">
                    {isLeft ? <TimelineEntry item={item} align="left" /> : <div className="hidden md:block" aria-hidden />}
                  </div>

                  <div className="hidden md:flex md:col-start-2 md:col-end-3 items-center justify-center py-4">
                    <TimelineNode />
                  </div>

                  <div className="pl-8 md:pl-0 md:col-start-3 md:col-end-4 flex md:justify-start md:items-center mt-0 md:mt-0">
                    {!isLeft ? (
                      <TimelineEntry item={item} align="right" />
                    ) : (
                      <div className="hidden md:block" aria-hidden />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}