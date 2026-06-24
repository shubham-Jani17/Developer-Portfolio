import { HERO_PORTRAIT_URL } from "../data/portfolio.js";

/** Normalize hero image paths for the public site */
export function resolveHeroImage(url) {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return HERO_PORTRAIT_URL;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}


