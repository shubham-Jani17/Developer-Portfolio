import { motion } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext";
import GlassCard from "../Components/GlassCard";
import GradientTitle from "../Components/GradientTitle";

export default function About() {
  const { portfolio } = usePortfolio();
  const { mission, site, statement } = portfolio;
  const stats = portfolio.stats ?? [];

  return (
    <section id="about" className="page-container section-pad relative">
      <div className="mb-10 sm:mb-14">
        <motion.h2
          className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.08] sm:leading-[1.05] max-w-4xl text-balance"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GradientTitle parts={statement.title} />
        </motion.h2>
        <motion.p
          className="mt-4 md:mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {statement.subtitle}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 sm:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-5 sm:p-8 md:p-10 h-full">
            <p className="font-mono-display text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.35em] uppercase text-muted-foreground mb-4 sm:mb-6">
              {mission.eyebrow}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug text-foreground">
              <GradientTitle parts={mission.title} />
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-sm md:text-base">
              {mission.body}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {(mission.tags ?? []).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono-display text-[10px] sm:text-[11px] tracking-wider text-foreground/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <GlassCard className="p-5 sm:p-6 md:p-7 h-full flex flex-col justify-center min-h-[100px] sm:min-h-[120px]">
                  <p
                    className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono-display text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-muted-foreground leading-snug">
                    {stat.label}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-5 md:p-6 flex items-center gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display font-bold text-sm text-slate-950"
                style={{
                  background: "linear-gradient(135deg, #7dd3fc, #c4b5fd)",
                }}
              >
                {site.initials}
              </span>
              <div>
                <p className="font-display font-semibold text-lg text-foreground">{site.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {site.location} · {site.availability}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
