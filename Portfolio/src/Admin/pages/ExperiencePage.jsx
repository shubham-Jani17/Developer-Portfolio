import { useRef } from "react";
import useAdminPortfolio from "../hooks/useAdminPortfolio";
import {
  AdminCard,
  AdminCardSave,
  AdminField,
  AdminListActions,
  AdminPage,
  adminInputClass,
} from "../components/AdminUi";

function newId() {
  return `exp-${crypto.randomUUID().slice(0, 8)}`;
}

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

export default function ExperiencePage() {
  const { portfolio, loading, saving, setPortfolio, save, isSaving, cardStatus } = useAdminPortfolio();
  if (loading || !portfolio) return <p className="text-muted-foreground">Loading…</p>;

  const { experience, experienceSection } = portfolio;
  const setSection = (patch) =>
    setPortfolio((p) => ({ ...p, experienceSection: { ...p.experienceSection, ...patch } }));

  const updateItem = (i, patch) => {
    const next = [...experience];
    next[i] = { ...next[i], ...patch };
    setPortfolio((p) => ({ ...p, experience: next }));
  };

  const moveItem = (i, direction) => {
    const next = [...experience];
    const targetIndex = direction === "up" ? i - 1 : i + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;

    const temp = next[i];
    next[i] = next[targetIndex];
    next[targetIndex] = temp;

    const nextPortfolio = { ...portfolio, experience: next };
    setPortfolio(nextPortfolio);
    save("page", nextPortfolio);
  };

  return (
    <AdminPage
      title="Experience"
      subtitle="Timeline entries — add, update, archive, or delete."
      actions={
        <button
          type="button"
          onClick={() =>
            setPortfolio((p) => ({
              ...p,
              experience: [
                {
                  id: newId(),
                  period: "2026",
                  title: "New role",
                  subtitle: "",
                  description: "",
                  tech: [],
                  archived: false,
                },
                ...p.experience,
              ],
            }))
          }
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
        >
          + Add entry
        </button>
      }
    >
      {experience.map((item, i) => (
        <AdminCard
          key={item.id || i}
          title={
            <span className="flex items-center gap-2">
              {item.title}
              {item.archived && (
                <span className="text-[10px] font-mono uppercase text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">
                  Archived
                </span>
              )}
            </span>
          }
        >
          {["period", "title", "subtitle", "description"].map((key) => (
            <AdminField key={key} label={key}>
              {key === "description" ? (
                <textarea
                  className={`${adminInputClass} min-h-[80px]`}
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(i, { [key]: e.target.value })}
                />
              ) : (
                <input
                  className={adminInputClass}
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(i, { [key]: e.target.value })}
                />
              )}
            </AdminField>
          ))}
          <div className="mb-4">
            <span className="contact-label block mb-1.5">Tech tags</span>
            <TagEditor
              tags={item.tech ?? []}
              onChange={(tech) => updateItem(i, { tech })}
            />
          </div>
          <AdminListActions
            archived={item.archived}
            onArchive={() => updateItem(i, { archived: !item.archived })}
            onDelete={() => {
              const next = {
                ...portfolio,
                experience: experience.filter((_, idx) => idx !== i),
              };
              setPortfolio(next);
              save("page", next);
            }}
            onMoveUp={i > 0 ? () => moveItem(i, "up") : undefined}
            onMoveDown={i < experience.length - 1 ? () => moveItem(i, "down") : undefined}
          />
          <AdminCardSave
            onSave={() => save(`experience-${item.id || i}`)}
            saving={isSaving(`experience-${item.id || i}`)}
            saveLocked={saving}
            {...cardStatus(`experience-${item.id || i}`)}
          />
        </AdminCard>
      ))}
    </AdminPage>
  );
}
