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
  return {
    site,
    hero: { ...hero, image: hero.image || HERO_PORTRAIT_URL },
    statement,
    mission,
    stats,
    social,
    contactSection,
    footer,
    navLinks,
    skillsSection,
    projectsSection,
    projects: projects.map((p, i) => ({ ...p, id: p.id || `proj-${i}`, archived: p.archived ?? false })),
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

/** Ensures API/CMS data always has the shape the public site expects, taking unmanaged data strictly from the static fallback. */
export function normalizePortfolio(raw) {
  const fallback = getStaticPortfolio();
  if (!raw || typeof raw !== "object" || Object.keys(raw).length === 0) {
    return fallback;
  }

  const rawSkills = raw.skills || raw.skillsSection?.categories;
  const skillsToUse = validateSkills(rawSkills) ? rawSkills : fallback.skillsSection.categories;

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

    // Fully managed sections
    stats: asArray(raw.stats, fallback.stats),
    social: asArray(raw.social, fallback.social),
    projects: asArray(raw.projects, fallback.projects),
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
