import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext";
import GlassCard from "../Components/GlassCard";
import GradientTitle from "../Components/GradientTitle";
import { getProjectCategoryFilters } from "../utils/projectFilters";
import { FaGithub } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";
import ProxyErrorSymbol from "../Components/ProxyErrorSymbol";

/* ─── Shared image panel ──────────────────────────────────────────────────── */
function ProjectImage({ project, side }) {
  return (
    <div
      className={`relative w-[42%] shrink-0 overflow-hidden bg-slate-900/50 ${
        side === "left" ? "border-r border-white/5" : "border-l border-white/5"
      }`}
    >
      {project.image ? (
        <img
          src={project.image}
          alt={project.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 grid-bg">
          <span className="font-display font-black text-5xl tracking-widest text-white/5 uppercase select-none">
            {project.title.slice(0, 2)}
          </span>
        </div>
      )}
      {project.category && (
        <span className="absolute top-4 left-4 rounded-full border border-cyan-400/30 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 font-mono-display text-[9px] tracking-wider text-cyan-300">
          {project.category}
        </span>
      )}
    </div>
  );
}

/* ─── Magazine card — large screens ──────────────────────────────────────── */
function MagazineCard({ project, index }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <GlassCard className="flex flex-row overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 min-h-[280px]">
        {isEven && <ProjectImage project={project} side="left" />}

        {/* Content */}
        <div className="flex flex-col justify-center flex-1 p-8 xl:p-10">
          <p className="font-mono-display text-[10px] tracking-[0.25em] uppercase text-cyan-400/70 mb-3">
            PROJECT / {String(index + 1).padStart(2, "0")}
          </p>

          <h3 className="font-display text-2xl xl:text-3xl font-bold text-foreground tracking-tight group-hover:text-cyan-300 transition-colors duration-300 leading-snug">
            {project.title}
          </h3>

          <div className="mt-3 mb-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full" />

          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            {project.description}
          </p>

          {project.tags && project.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono-display text-[10px] tracking-wide text-foreground/60 hover:border-cyan-500/30 hover:text-cyan-300 transition-all duration-200"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {(project.liveUrl || project.repoUrl) && (
            <div className="mt-6 flex items-center gap-4">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono-display tracking-wider px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300"
                >
                  <FaGithub className="text-sm" />
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono-display tracking-wider px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300"
                >
                  Live Demo
                  <HiArrowUpRight className="text-sm" />
                </a>
              )}
            </div>
          )}
        </div>

        {!isEven && <ProjectImage project={project} side="right" />}
      </GlassCard>
    </motion.div>
  );
}

/* ─── Compact grid card — mobile / tablet ─────────────────────────────────── */
function GridCard({ project }) {
  return (
    <GlassCard className="flex flex-col h-full overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900/50 border-b border-white/5">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 grid-bg relative">
            <span className="font-display font-black text-2xl tracking-widest text-white/5 uppercase select-none">
              {project.title.slice(0, 2)}
            </span>
          </div>
        )}
        {project.category && (
          <span className="absolute top-4 left-4 rounded-full border border-cyan-400/30 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 font-mono-display text-[9px] tracking-wider text-cyan-300">
            {project.category}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-display text-xl font-bold text-foreground tracking-tight group-hover:text-cyan-300 transition-colors duration-300">
          {project.title}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-grow">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 font-mono-display text-[9px] tracking-wide text-foreground/60"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {(project.liveUrl || project.repoUrl) && (
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono-display tracking-wider text-muted-foreground hover:text-cyan-300 transition-colors"
              >
                <FaGithub className="text-sm" /> CODE
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono-display tracking-wider text-muted-foreground hover:text-cyan-300 transition-colors ml-auto"
              >
                LIVE DEMO <HiArrowUpRight className="text-sm" />
              </a>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function Projects() {
  const { portfolio, fromApi } = usePortfolio();
  const projectsSection = portfolio.projectsSection ?? {
    eyebrow: "SELECTED WORK",
    title: { before: "Projects I'm ", highlight: "proud", after: " of." },
    subtitle: "A small selection of recent products — each one shipped with obsessive care.",
  };
  const projects = portfolio.projects ?? [];
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filters = getProjectCategoryFilters(projects);

  const filteredProjects =
    selectedFilter === "ALL"
      ? projects
      : projects.filter(
          (p) =>
            (p.category ?? "").trim().toUpperCase() === selectedFilter.toUpperCase()
        );

  return (
    <section id="projects" className="page-container section-pad relative">
      <motion.header
        className="mb-10 sm:mb-14 md:mb-20 text-center md:text-left"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono-display text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-muted-foreground mb-3 sm:mb-4">
          {projectsSection.eyebrow}
        </p>
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.12] sm:leading-[1.1] max-w-3xl mx-auto md:mx-0 text-balance">
          <GradientTitle parts={projectsSection.title} />
        </h2>
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto md:mx-0">
          {projectsSection.subtitle}
        </p>
      </motion.header>

      {!fromApi ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
        <>
          {/* Filter tabs */}
          {filters.length > 1 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-10 md:mb-12">
              {filters.map((filter) => {
                const isActive = selectedFilter.toUpperCase() === filter.toUpperCase();
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 text-xs font-mono-display tracking-wider rounded-full border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                        : "bg-white/[0.02] border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Large screens: magazine alternating stack ── */}
          <div className="hidden lg:flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <MagazineCard
                  key={project.id || project.title}
                  project={project}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Mobile / tablet: compact grid ── */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id || project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="h-full"
                >
                  <GridCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </section>
  );
}
