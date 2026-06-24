import { useState, useRef } from "react";
import useAdminPortfolio from "../hooks/useAdminPortfolio";
import { uploadProjectImage } from "../api/client";
import {
  AdminCard,
  AdminCardSave,
  AdminField,
  AdminListActions,
  AdminPage,
  adminInputClass,
} from "../components/AdminUi";

function newId() {
  return `proj-${crypto.randomUUID().slice(0, 8)}`;
}

// ── Tag pill chip editor (ported from AboutPage) ────────────────────────────
function TagEditor({ tags = [], onChange }) {
  const inputRef = useRef(null);

  function commit(raw) {
    const val = raw.trim().replace(/,+$/, "").trim().toUpperCase();
    if (!val || tags.includes(val)) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange([...tags, val]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(e.target.value);
    } else if (e.key === "Backspace" && e.target.value === "" && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  function handleBlur(e) {
    if (e.target.value.trim()) commit(e.target.value);
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="w-full">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-[11px] tracking-wider text-foreground/90"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-muted-foreground hover:text-red-400 transition-colors leading-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a tag and press Enter or comma…"
        className={adminInputClass}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <p className="mt-1.5 text-[11px] text-muted-foreground/60">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">,</kbd> to add · click ✕ to remove
      </p>
    </div>
  );
}

// ── Category chip editor ────────────────────────────────────────────────────
// Single-value variant of TagEditor — replaces the current value on commit.
function CategoryEditor({ value = "", onChange }) {
  const inputRef = useRef(null);

  function commit(raw) {
    const val = raw.trim().replace(/,+$/, "").trim().toUpperCase();
    if (inputRef.current) inputRef.current.value = "";
    if (val) onChange(val);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(e.target.value);
    } else if (e.key === "Backspace" && e.target.value === "" && value) {
      onChange("");
    }
  }

  function handleBlur(e) {
    if (e.target.value.trim()) commit(e.target.value);
  }

  return (
    <div className="w-full">
      {value && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-[11px] tracking-wider text-foreground/90">
            {value}
            <button
              type="button"
              aria-label="Remove category"
              onClick={() => onChange("")}
              className="ml-0.5 text-muted-foreground hover:text-red-400 transition-colors leading-none"
            >
              ✕
            </button>
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={value ? "Type to replace category…" : "Type a category and press Enter…"}
        className={adminInputClass}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <p className="mt-1.5 text-[11px] text-muted-foreground/60">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">,</kbd> to set · click ✕ to clear
      </p>
    </div>
  );
}

function ProjectImageInput({ value, onChange, projectId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    
    setUploading(true);
    setError("");
    
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      
      const res = await uploadProjectImage(dataUrl, projectId);
      onChange(res.imageUrl);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className={adminInputClass}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL or upload..."
        />
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/webp" 
          className="hidden" 
          ref={fileRef} 
          onChange={handleUpload} 
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 text-xs font-semibold text-foreground disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
        >
          {uploading ? "Uploading…" : "Upload file"}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function ProjectsPage() {
  const { portfolio, loading, saving, setPortfolio, save, isSaving, cardStatus } =
    useAdminPortfolio();
  if (loading || !portfolio) return <p className="text-muted-foreground">Loading…</p>;

  const { projects } = portfolio;

  const updateProject = (i, patch) => {
    const next = [...projects];
    next[i] = { ...next[i], ...patch };
    setPortfolio((p) => ({ ...p, projects: next }));
  };

  return (
    <AdminPage
      title="Projects"
      subtitle="Each project's category becomes a filter button on the public site automatically. Save each card after editing."
      actions={
        <button
          type="button"
          onClick={() =>
            setPortfolio((p) => ({
              ...p,
              projects: [
                {
                  id: newId(),
                  title: "New project",
                  category: "FULL STACK",
                  description: "",
                  image: "",
                  tags: [],
                  liveUrl: "",
                  repoUrl: "",
                  archived: false,
                },
                ...p.projects,
              ],
            }))
          }
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
        >
          + New project
        </button>
      }
    >
      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">No projects yet. Add one above.</p>
      )}

      {projects.map((project, i) => {
        const scope = `project-${project.id || i}`;
        return (
          <AdminCard
            key={project.id || i}
            title={
              <span className="flex items-center gap-2">
                {project.title}
                {project.archived && (
                  <span className="text-[10px] font-mono uppercase text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">
                    Archived
                  </span>
                )}
              </span>
            }
          >
            {["title", "category", "description", "image", "liveUrl", "repoUrl"].map((key) => (
              <AdminField
                key={key}
                label={key}
                hint={
                  key === "category"
                    ? "Used as the filter button label on the public portfolio (e.g. FULL STACK, AI)."
                    : undefined
                }
              >
                {key === "description" ? (
                  <textarea
                    className={`${adminInputClass} min-h-[80px]`}
                    value={project[key] ?? ""}
                    onChange={(e) => updateProject(i, { [key]: e.target.value })}
                  />
                ) : key === "image" ? (
                  <ProjectImageInput
                    value={project[key]}
                    onChange={(newVal) => updateProject(i, { [key]: newVal })}
                    projectId={project.id}
                  />
                ) : key === "category" ? (
                  <CategoryEditor
                    value={project.category ?? ""}
                    onChange={(val) => updateProject(i, { category: val })}
                  />
                ) : (
                  <input
                    className={adminInputClass}
                    value={project[key] ?? ""}
                    onChange={(e) => updateProject(i, { [key]: e.target.value })}
                  />
                )}
              </AdminField>
            ))}
            <div className="mb-4">
              <span className="contact-label block mb-1.5">Tags</span>
              <TagEditor
                tags={project.tags ?? []}
                onChange={(tags) => updateProject(i, { tags })}
              />
            </div>
            <AdminListActions
              archived={project.archived}
              onArchive={() => updateProject(i, { archived: !project.archived })}
              onDelete={() => {
                const next = {
                  ...portfolio,
                  projects: projects.filter((_, idx) => idx !== i),
                };
                setPortfolio(next);
                save("page", next);
              }}
            />
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
