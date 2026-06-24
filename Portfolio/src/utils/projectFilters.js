/** Build public project filter buttons from project categories (always starts with ALL). */
export function getProjectCategoryFilters(projects) {
  const categories = [];
  const seen = new Set();

  for (const project of projects ?? []) {
    const category = (project.category ?? "").trim();
    if (!category) continue;
    const key = category.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    categories.push(category);
  }

  return ["ALL", ...categories];
}
