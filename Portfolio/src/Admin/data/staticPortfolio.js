import { HERO_PORTRAIT_URL } from "./portfolio.js";
import {
  site,
  hero,
  statement,
  mission,
  stats,
  social,
  contactSection,
  footer,
  navLinks,
  skillsSection,
  projectsSection,
  projects,
  experienceSection,
  experience,
  sections,
  blogs,
} from "./portfolio.js";

export function getStaticPortfolio() {
  const staticProjects = projects.map((p, i) => ({ ...p, id: p.id || `proj-${i}`, archived: p.archived ?? false }));
  const staticSkillCategories = skillsSection.categories;

  // Auto-compute shipped/tech counts from static data
  const shippedCount = staticProjects.filter((p) => !p.archived).length;
  const allSkillNames = new Set(
    staticSkillCategories.flatMap((cat) =>
      (cat.items ?? []).map((item) => item.name?.trim().toLowerCase()).filter(Boolean)
    )
  );
  const techCount = allSkillNames.size;
  const computedStats = stats.map((stat) => {
    const label = stat.label?.toLowerCase() ?? "";
    if (label === "projects shipped") return { ...stat, value: `${shippedCount}+` };
    if (label === "tech stacks mastered") return { ...stat, value: `${techCount}+` };
    return stat;
  });

  return {
    site,
    hero: { ...hero, image: hero.image || HERO_PORTRAIT_URL },
    statement,
    mission,
    stats: computedStats,
    social,
    contactSection,
    footer,
    navLinks,
    skillsSection,
    projectsSection,
    projects: staticProjects,
    experienceSection,
    experience: experience.map((e, i) => ({ ...e, id: e.id || `exp-${i}`, archived: e.archived ?? false })),
    sections,
    blogs: blogs.map((b, i) => ({ ...b, id: b.id || `blog-${i}`, archived: b.archived ?? false })),
  };
}

function asArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function validateSkills(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return false;
  return skills.every(
    (cat) =>
      cat &&
      typeof cat === "object" &&
      typeof cat.name === "string" &&
      Array.isArray(cat.items)
  );
}

/**
 * Labels (lowercased) that identify the auto-computed stat cards.
 * These values are matched against stat.label for replacement.
 */
const PROJECTS_LABEL = "projects shipped";
const TECH_LABEL = "tech stacks mastered";

/**
 * Replaces "PROJECTS SHIPPED" and "TECH STACKS MASTERED" stat values
 * with live counts derived from the current projects list and skills categories.
 * All other stats are left untouched.
 */
function computeStats(stats, projects, skillCategories) {
  // Count non-archived projects
  const shippedCount = (projects ?? []).filter((p) => !p.archived).length;

  // Count unique skill names across all categories
  const allSkillNames = new Set(
    (skillCategories ?? []).flatMap((cat) =>
      (cat.items ?? []).map((item) => item.name?.trim().toLowerCase()).filter(Boolean)
    )
  );
  const techCount = allSkillNames.size;

  return (stats ?? []).map((stat) => {
    const label = stat.label?.toLowerCase() ?? "";
    if (label === PROJECTS_LABEL) {
      return { ...stat, value: `${shippedCount}+` };
    }
    if (label === TECH_LABEL) {
      return { ...stat, value: `${techCount}+` };
    }
    return stat;
  });
}


export function normalizePortfolio(raw) {
  const fallback = getStaticPortfolio();
  if (!raw || typeof raw !== "object" || Object.keys(raw).length === 0) {
    return fallback;
  }

  const rawSkills = raw.skills || raw.skillsSection?.categories;
  const skillsToUse = validateSkills(rawSkills) ? rawSkills : fallback.skillsSection.categories;

  const resolvedProjects = asArray(raw.projects, fallback.projects);
  const resolvedStats = computeStats(
    asArray(raw.stats, fallback.stats),
    resolvedProjects,
    skillsToUse
  );

  return {
    ...fallback,
    
    // Partially managed: site (SettingsPage)
    site: {
      ...fallback.site,
      email: raw.site?.email ?? fallback.site.email,
      location: raw.site?.location ?? fallback.site.location,
      resumeUrl: raw.site?.resumeUrl ?? fallback.site.resumeUrl,
    },

    // Partially managed: hero (SettingsPage)
    hero: {
      ...fallback.hero,
      image: raw.hero?.image?.trim() ? raw.hero.image : fallback.hero.image,
    },

    // Partially managed: mission (AboutPage)
    mission: {
      ...fallback.mission,
      body: raw.mission?.body ?? fallback.mission.body,
      tags: asArray(raw.mission?.tags, fallback.mission.tags),
    },

    // Fully managed sections — stats auto-computed from live projects & skills
    stats: resolvedStats,
    social: asArray(raw.social, fallback.social),
    projects: resolvedProjects,
    experience: asArray(raw.experience, fallback.experience),
    blogs: asArray(raw.blogs, fallback.blogs),
    
    // Partially managed: skillsSection (SkillsPage manages categories via 'skills' array)
    skillsSection: {
      ...fallback.skillsSection,
      categories: skillsToUse,
    },
    // Add raw 'skills' so Admin can read/write it directly
    skills: skillsToUse,

    // Fully unmanaged sections (always take from static fallback)
    statement: fallback.statement,
    contactSection: fallback.contactSection,
    footer: fallback.footer,
    navLinks: fallback.navLinks,
    projectsSection: fallback.projectsSection,
    experienceSection: fallback.experienceSection,
    sections: fallback.sections,
  };
}
