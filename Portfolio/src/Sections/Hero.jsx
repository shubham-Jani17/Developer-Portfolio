import { useEffect, useState } from "react";
import { resolveHeroImage } from "../utils/heroImage";
import { motion } from "framer-motion";
import {
  HiArrowUpRight,
  HiArrowDownTray,
  HiArrowPath,
} from "react-icons/hi2";
import { usePortfolio } from "../context/PortfolioContext";
import { useTypewriter } from "../hooks/useTypewriter";
import useLiteMode from "../hooks/useLiteMode";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  const { portfolio } = usePortfolio();
  const { hero, site } = portfolio;
  const lite = useLiteMode();
  const roleText = useTypewriter(hero.roles, { paused: lite });
  const [imgError, setImgError] = useState(false);
  const portraitSrc = resolveHeroImage(hero.image);

  useEffect(() => {
    setImgError(false);
  }, [portraitSrc]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="page-container section-pad below-nav relative flex min-h-[100dvh] min-h-screen items-center pb-12 sm:pb-14 md:pb-16"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 sm:gap-10 lg:gap-12 xl:gap-14 items-center">
        {/* Left column */}
        <div className="order-2 lg:order-1">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          >
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/10 px-3 py-1.5 sm:px-4 text-[10px] sm:text-[11px] font-mono-display font-medium tracking-[0.12em] sm:tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-300/95">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              {hero.availabilityBadge}
            </span>

            <h1 className="mt-6 sm:mt-8 font-display font-black tracking-tight leading-[0.95] sm:leading-[0.92] text-balance">
              <span className="block text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] text-foreground">
                {hero.firstName}
              </span>
              <span className="block mt-1 text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] text-gradient">
                {hero.lastName}
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-foreground/80 font-medium min-h-[1.75rem] sm:min-h-[2rem]">
              <span className="mr-1" aria-hidden>
                ✨
              </span>
              {roleText}
              <span className="inline-block w-[2px] h-[1.1em] ml-0.5 align-middle bg-cyan-400 animate-pulse" />
            </p>

            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {hero.bio}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => scrollTo("projects")}
                className="magnetic-btn inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white/95 shadow-lg shadow-black/20 transition-colors"
              >
                View Projects
                <HiArrowUpRight className="h-4 w-4" />
              </button>

              {site.resumeUrl ? (
                <a
                  href={site.resumeUrl}
                  download="Shubham_Jani_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="magnetic-btn inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-border bg-muted/30 dark:border-white/15 dark:bg-white/5 px-5 sm:px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 dark:hover:bg-white/10 transition-colors"
                >
                  Download Resume
                  <HiArrowDownTray className="h-4 w-4" />
                </a>
              ) : (
                <span className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-border bg-muted/20 px-5 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed">
                  Download Resume
                  <HiArrowDownTray className="h-4 w-4" />
                </span>
              )}
              <button
                type="button"
                onClick={() => scrollTo("contact")}
                className="magnetic-btn inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-border dark:border-white/15 bg-muted/30 dark:bg-white/5 px-5 sm:px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 dark:hover:bg-white/10 transition-colors"
              >
                Contact Me
              </button>
            </div>

            <div className="mt-5 sm:mt-6 inline-flex max-w-full items-center gap-3 rounded-full border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.04] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-muted-foreground dark:text-white/70 backdrop-blur-sm">
              <HiArrowPath
                className={`h-4 w-4 text-emerald-400 ${lite ? "" : "animate-spin"}`}
                aria-hidden
              />
              <span className="font-mono-display text-xs sm:text-sm tracking-wide">
                {hero.serverStatus}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]" aria-hidden />
            </div>
          </motion.div>
        </div>

        {/* Right column — portrait */}
        <motion.div
          className="order-1 lg:order-2 relative mx-auto w-full max-w-[min(100%,340px)] sm:max-w-md lg:max-w-none"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden neon-border aspect-[4/5] sm:aspect-[3/4] max-h-[min(60vh,420px)] sm:max-h-[min(68vh,500px)] lg:max-h-[min(72vh,560px)] w-full shadow-[0_0_80px_-20px_rgba(0,229,255,0.35)]">
            {/* Portrait area */}
            <div className="relative flex-1 min-h-0">
              {!imgError && portraitSrc ? (
                <img
                  src={portraitSrc}
                  alt={hero.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(0,229,255,0.25) 0%, rgba(15,23,42,1) 40%, rgba(157,76,221,0.45) 100%)",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-6xl font-black text-white/20">
                      {site.initials}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status bar — unchanged below the image */}
            <div className="shrink-0 border-t border-white/10 bg-black/50 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-4">
              <p className="font-mono-display text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/45">
                {hero.statusLabel}
              </p>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-white/90 font-medium leading-snug">
                {hero.statusText}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
