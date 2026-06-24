import { motion } from "framer-motion";
import { HiDocumentText, HiArrowDownTray, HiArrowUpRight } from "react-icons/hi2";
import { usePortfolio } from "../context/PortfolioContext";

export default function ResumeCallout() {
  const { portfolio } = usePortfolio();
  const { site } = portfolio;
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="page-container section-pad-tight relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[280px] h-[280px] bg-violet-500/10 rounded-full blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a1220]/85 backdrop-blur-md p-5 sm:p-8 md:p-10 lg:p-12 overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.02),0_0_40px_rgba(157,76,221,0.02)]"
      >
        {/* Subtle interior lighting */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 sm:gap-8 md:gap-10 items-center relative z-10">

          {/* Left Column (Content) */}
          <div className="flex flex-col items-start text-left">
            {/* Resume pill badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-mono-display font-medium tracking-[0.25em] uppercase text-white/70">
              <HiDocumentText className="h-3 w-3 text-cyan-400" />
              Resume
            </span>

            {/* Title */}
            <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1] max-w-md">
              Want the <span className="text-gradient">whole story</span>?
            </h2>

            {/* Paragraph description */}
            <p className="mt-4 text-muted-foreground/90 text-xs sm:text-sm leading-relaxed max-w-xl">
              Grab a tightly-edited 1-page PDF with my full timeline, awards and selected projects. Or skip the formality — let's just hop on a call.
            </p>

            {/* Button Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {site.resumeUrl ? (
                <a
                  href={site.resumeUrl}
                  download="Shubham_Jani_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="magnetic-btn inline-flex items-center gap-2 rounded-full bg-white hover:bg-white/95 px-5 py-3 text-xs font-bold text-slate-900 shadow-[0_4px_15px_rgba(0,229,255,0.2)] transition-all hover:shadow-[0_4px_20px_rgba(0,229,255,0.3)]"
                >
                  <HiArrowDownTray className="h-3.5 w-3.5" />
                  Download Resume
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-medium text-white/40 cursor-not-allowed">
                  <HiArrowDownTray className="h-3.5 w-3.5" />
                  Download Resume
                </span>
              )}

              <button
                type="button"
                onClick={() => scrollTo("contact")}
                className="magnetic-btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-semibold text-white transition-all"
              >
                Let's collaborate
                <HiArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (Resume Mockup Preview) */}
          <div className="w-full flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 15 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-w-[270px] aspect-[1/1.25] bg-[#0c1424]/40 border border-white/10 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/15 transition-all duration-300"
            >
              {/* Highlight lines inside card */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

              <div>
                {/* Colored gradient header */}
                <div className="w-full h-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-sm" />

                {/* Secondary line under header */}
                <div className="w-1/3 h-1.5 bg-white/10 rounded-sm mt-3" />

                {/* Additional simulated text lines to look like a resume layout */}
                <div className="w-full h-1 bg-white/5 rounded-sm mt-5" />
                <div className="w-5/6 h-1 bg-white/5 rounded-sm mt-1.5" />
                <div className="w-4/5 h-1 bg-white/5 rounded-sm mt-1.5" />
              </div>

              {/* Skills/Pills Showcase (Middle) */}
              <div className="flex flex-wrap gap-1.5 my-auto pt-2">
                {["Python", "Flask", "FastAPI", "AI"].map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/10 bg-white/[0.03] text-white/60 px-2 py-0.5 rounded-full text-[9px] font-mono-display uppercase tracking-wider transition-colors duration-300 group-hover:text-white/80 group-hover:border-white/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Document footer (Bottom-right) */}
              <span className="text-[8px] font-mono-display text-white/30 self-end select-none">
                v2025.12 · PDF
              </span>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
