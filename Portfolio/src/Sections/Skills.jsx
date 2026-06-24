import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext";
import SectionHeader from "../Components/SectionHeader";
import GlassCard from "../Components/GlassCard";
import ProxyErrorSymbol from "../Components/ProxyErrorSymbol";
import {
  SiHtml5,
  SiJavascript,
  SiBootstrap,
  SiTailwindcss,
  SiSvelte,
  SiPython,
  SiFlask,
  SiFastapi,
  SiMysql,
  SiSqlite,
  SiOpencv,
  SiGit,
  SiGithub,
  SiFigma,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { FaDatabase, FaBrain, FaRobot, FaMicrochip, FaEnvelope, FaCode, FaLaptopCode } from "react-icons/fa";

function getSkillIcon(name) {
  const n = name.toLowerCase().trim();
  
  if (n.includes("html") || n.includes("css")) return <SiHtml5 className="text-[#E34F26]" />;
  if (n === "javascript" || n === "js") return <SiJavascript className="text-[#F7DF1E]" />;
  if (n === "bootstrap") return <SiBootstrap className="text-[#7952B3]" />;
  if (n.includes("tailwind")) return <SiTailwindcss className="text-[#06B6D4]" />;
  if (n.includes("svelte")) return <SiSvelte className="text-[#FF3E00]" />;
  
  if (n === "python") return <SiPython className="text-[#3776AB]" />;
  if (n === "flask") return <SiFlask className="text-[#ffffff]" />;
  if (n === "fastapi") return <SiFastapi className="text-[#009688]" />;
  if (n.includes("mysql") || n.includes("sql")) return <SiMysql className="text-[#4479A1]" />;
  if (n.includes("sqlite")) return <SiSqlite className="text-[#003B57]" />;
  if (n.includes("sqlalchemy")) return <FaDatabase className="text-[#D11919]" />;
  
  if (n === "opencv") return <SiOpencv className="text-[#5C3EE8]" />;
  if (n.includes("face recognition")) return <FaBrain className="text-[#FF69B4]" />;
  if (n.includes("nlp") || n.includes("voice")) return <FaRobot className="text-[#4CAF50]" />;
  if (n.includes("iot") || n.includes("prototyping")) return <FaMicrochip className="text-[#FF9800]" />;
  if (n.includes("computer vision")) return <FaBrain className="text-[#2196F3]" />;
  
  if (n.includes("git") && n.includes("github")) return <SiGithub className="text-white" />;
  if (n === "git") return <SiGit className="text-[#F05032]" />;
  if (n === "github") return <SiGithub className="text-white" />;
  if (n.includes("vs code") || n.includes("vscode")) return <VscVscode className="text-[#007ACC]" />;
  if (n.includes("emailjs") || n.includes("formsubmit")) return <FaEnvelope className="text-[#FFEB3B]" />;
  if (n.includes("dbms") || n.includes("oop")) return <FaLaptopCode className="text-[#9C27B0]" />;
  if (n === "figma") return <SiFigma className="text-[#F24E1E]" />;

  return <FaCode className="text-muted-foreground" />;
}

const getTabLabel = (name) => {
  const n = name.toLowerCase();
  if (n === "frontend") return "Frontend Development";
  if (n === "backend & data" || n === "backend") return "Backend Development";
  if (n === "ai & iot") return "AI & IoT / UI/UX";
  if (n === "tools & concepts" || n === "tools") return "Tools & Others";
  return name;
};

export default function Skills() {
  const { portfolio, fromApi } = usePortfolio();
  const skillsSection = portfolio.skillsSection ?? { categories: [], orbit: [] };

  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  const activeSkills = skillsSection.categories?.[activeCategoryIdx]?.items ?? [];

  return (
    <section id="skills" className="page-container section-pad relative">
      <SectionHeader
        eyebrow={skillsSection.eyebrow}
        title={skillsSection.title}
        subtitle={skillsSection.subtitle}
      />

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
        <div className="w-full flex flex-col items-center">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {(skillsSection.categories ?? []).map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategoryIdx(idx)}
                className={`rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer ${
                  activeCategoryIdx === idx
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 bg-transparent"
                }`}
              >
                {getTabLabel(cat.name)}
              </button>
            ))}
          </div>

          {/* Skill Cards Container */}
          <GlassCard className="p-6 sm:p-8 lg:p-10 w-full max-w-5xl mx-auto min-h-[220px] transition-all duration-300">
            {/* Title inside container */}
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">
              {getTabLabel(skillsSection.categories?.[activeCategoryIdx]?.name ?? "Skills")}
            </h3>

            {/* Skill Items Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4"
              >
                {activeSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] cursor-default"
                  >
                    <div className="text-xl shrink-0 transition-transform duration-300 group-hover:scale-110">
                      {getSkillIcon(skill.name)}
                    </div>
                    <span className="font-mono-display text-[12px] sm:text-[13px] text-foreground/80 group-hover:text-white transition-colors duration-300 leading-none">
                      {skill.name}
                    </span>
                  </div>
                ))}

                {activeSkills.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                    No skills listed in this category.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      )}
    </section>
  );
}
