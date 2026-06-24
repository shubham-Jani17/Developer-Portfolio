import useAdminPortfolio from "../hooks/useAdminPortfolio";
import {
  AdminCard,
  AdminCardSave,
  AdminField,
  AdminPage,
  adminInputClass,
} from "../components/AdminUi";
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

export default function SkillsPage() {
  const { portfolio, loading, saving, setPortfolio, save, isSaving, cardStatus } =
    useAdminPortfolio();
  if (loading || !portfolio) return <p className="text-muted-foreground">Loading…</p>;

  const skills = portfolio.skills || portfolio.skillsSection?.categories || [];
  const setSkills = (patch) => setPortfolio((p) => ({ ...p, skills: patch }));

  // ── Add a brand-new empty category ──────────────────────────────────────
  function addCategory() {
    setSkills([
      ...skills,
      { name: "", items: [{ name: "" }] },
    ]);
  }

  return (
    <AdminPage
      title="Skills"
      subtitle="Edit each card and save independently. Changes sync to the public portfolio."
      actions={
        <button
          type="button"
          onClick={addCategory}
          className="rounded-full bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 hover:border-cyan-400/60 text-cyan-400 px-4 py-2 text-sm font-medium transition-all"
        >
          + New Skill Category
        </button>
      }
    >
      {skills.map((cat, ci) => {
        const scope = `skills-category-${ci}`;
        return (
          <AdminCard key={ci} title={`Category: ${cat.name}`}>
            {/* Category name */}
            <AdminField label="Category name">
              <input
                className={adminInputClass}
                placeholder="e.g. New category"
                value={cat.name}
                onChange={(e) => {
                  const newSkills = [...skills];
                  newSkills[ci] = { ...newSkills[ci], name: e.target.value };
                  setSkills(newSkills);
                }}
              />
            </AdminField>

            {/* Skills list */}
            {(cat.items || []).map((item, ii) => (
              <div key={ii} className="grid grid-cols-[40px_1fr_40px] gap-3 mb-2.5 items-center">
                {/* Dynamically resolved tech logo */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-white/5 text-xl">
                  {getSkillIcon(item.name)}
                </div>
                <input
                  className={adminInputClass}
                  placeholder="e.g. New skill"
                  value={item.name}
                  onChange={(e) => {
                    const newSkills = structuredClone(skills);
                    newSkills[ci].items[ii].name = e.target.value;
                    setSkills(newSkills);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSkills = structuredClone(skills);
                    newSkills[ci].items.splice(ii, 1);
                    setSkills(newSkills);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 cursor-pointer transition-all duration-200"
                  title="Delete skill"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add skill */}
            <button
              type="button"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
              onClick={() => {
                const newSkills = structuredClone(skills);
                if (!newSkills[ci].items) newSkills[ci].items = [];
                newSkills[ci].items.push({ name: "" });
                setSkills(newSkills);
              }}
            >
              + Add skill
            </button>

            {/* Per-card save */}
            <AdminCardSave
              onSave={() => save(scope)}
              saving={isSaving(scope)}
              saveLocked={saving}
              {...cardStatus(scope)}
            />
          </AdminCard>
        );
      })}
    </AdminPage>
  );
}
