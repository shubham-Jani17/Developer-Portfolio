import { useRef } from "react";
import useAdminPortfolio from "../hooks/useAdminPortfolio";
import {
  AdminCard,
  AdminField,
  AdminPage,
  AdminSaveBar,
  adminInputClass,
} from "../components/AdminUi";

// ── Preset colour palette (matches portfolio design system) ─────────────────
const PRESET_COLORS = [
  // Cyans
  { hex: "#22d3ee", label: "Cyan 400" },
  { hex: "#06b6d4", label: "Cyan 500" },
  { hex: "#7dd3fc", label: "Sky 300" },
  { hex: "#38bdf8", label: "Sky 400" },
  // Blues
  { hex: "#60a5fa", label: "Blue 400" },
  { hex: "#3b82f6", label: "Blue 500" },
  { hex: "#93c5fd", label: "Blue 300" },
  // Purples / Violets
  { hex: "#c4b5fd", label: "Violet 300" },
  { hex: "#a78bfa", label: "Violet 400" },
  { hex: "#8b5cf6", label: "Violet 500" },
  { hex: "#d8b4fe", label: "Purple 300" },
  // Emeralds / Greens
  { hex: "#6ee7b7", label: "Emerald 300" },
  { hex: "#34d399", label: "Emerald 400" },
  { hex: "#10b981", label: "Emerald 500" },
  // Rose / Pinks
  { hex: "#fda4af", label: "Rose 300" },
  { hex: "#fb7185", label: "Rose 400" },
  // Ambers
  { hex: "#fcd34d", label: "Amber 300" },
  { hex: "#fbbf24", label: "Amber 400" },
];

// ── Color Picker component ──────────────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  const nativeRef = useRef(null);
  const color = value || "#7dd3fc";

  function handleHexInput(e) {
    const raw = e.target.value;
    onChange(raw);
  }

  function handleHexBlur(e) {
    // Normalise on blur — add # if missing, fall back to current colour
    let raw = e.target.value.trim();
    if (raw && !raw.startsWith("#")) raw = "#" + raw;
    const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw);
    onChange(isValid ? raw : color);
  }

  return (
    <div className="space-y-3">
      {/* Row: native picker trigger + hex text input */}
      <div className="flex items-center gap-3">
        {/* Clickable swatch that opens OS native color picker */}
        <div className="relative shrink-0">
          <button
            type="button"
            title="Open colour picker"
            onClick={() => nativeRef.current?.click()}
            className="h-10 w-10 rounded-xl border-2 border-white/20 hover:border-white/40 transition-colors shadow-lg cursor-pointer"
            style={{ background: color }}
          />
          {/* Hidden native input — visually replaced by the swatch above */}
          <input
            ref={nativeRef}
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#7dd3fc"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            tabIndex={-1}
            aria-hidden
          />
        </div>

        {/* Hex text input */}
        <input
          type="text"
          className={`${adminInputClass} font-mono uppercase`}
          value={color}
          maxLength={7}
          placeholder="#7dd3fc"
          onChange={handleHexInput}
          onBlur={handleHexBlur}
          spellCheck={false}
        />

        {/* Live preview label */}
        <span
          className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold tracking-wider border border-white/10 whitespace-nowrap"
          style={{ color, borderColor: color + "55", background: color + "18" }}
        >
          Preview
        </span>
      </div>

      {/* Preset palette grid */}
      <div>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              type="button"
              title={`${label} · ${hex}`}
              onClick={() => onChange(hex)}
              className="relative h-6 w-6 rounded-full border-2 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{
                background: hex,
                borderColor: color === hex ? "white" : hex + "55",
                boxShadow: color === hex ? `0 0 0 2px ${hex}88` : "none",
              }}
            >
              {/* Active check mark */}
              {color === hex && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold drop-shadow">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tag pill chip editor ────────────────────────────────────────────────────
// Lets users add tags by typing then pressing Enter or comma, and remove
// tags by clicking the ✕ button on each pill. No textarea splitting bugs.
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
    // Use a div (NOT a label) to avoid browser focus-jump glitch
    <div className="w-full">
      {/* Live preview pills */}
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

      {/* Input */}
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

// ── Page ────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { portfolio, loading, saving, message, error, setPortfolio, save } = useAdminPortfolio();
  if (loading || !portfolio) return <p className="text-muted-foreground">Loading…</p>;

  const { mission, stats } = portfolio;
  const setMission = (patch) =>
    setPortfolio((p) => ({ ...p, mission: { ...p.mission, ...patch } }));

  return (
    <AdminPage title="About" subtitle="Mission block and stat cards.">
      <AdminCard title="Mission">
        {/* Body — safe to use AdminField (single textarea, no focus-jump risk) */}
        <AdminField label="Body">
          <textarea
            className={`${adminInputClass} min-h-[120px]`}
            value={mission.body ?? ""}
            onChange={(e) => setMission({ body: e.target.value })}
          />
        </AdminField>

        {/* Tags — use plain div wrapper to prevent browser focus-jump glitch */}
        <div className="mb-4">
          <span className="contact-label block mb-1.5">Tags</span>
          <TagEditor
            tags={mission.tags ?? []}
            onChange={(tags) => setMission({ tags })}
          />
        </div>
      </AdminCard>

      {/* Stats — card per stat, full ColorPicker for colour selection */}
      <AdminCard title="Stats">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="mb-5 pb-5 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
          >
            {/* Header row: stat number + delete */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ color: stat.color || "#7dd3fc" }}
              >
                Stat {i + 1}
              </span>
              <button
                type="button"
                aria-label="Remove stat"
                onClick={() => {
                  const next = stats.filter((_, idx) => idx !== i);
                  setPortfolio((p) => ({ ...p, stats: next }));
                }}
                className="text-[11px] text-muted-foreground hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 rounded-full px-2.5 py-0.5"
              >
                Remove
              </button>
            </div>

            {/* Value + Label inputs side by side */}
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5">Value</p>
                <input
                  className={adminInputClass}
                  placeholder="e.g. 4+"
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], value: e.target.value };
                    setPortfolio((p) => ({ ...p, stats: next }));
                  }}
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5">Label</p>
                <input
                  className={adminInputClass}
                  placeholder="e.g. PROJECTS SHIPPED"
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], label: e.target.value };
                    setPortfolio((p) => ({ ...p, stats: next }));
                  }}
                />
              </div>
            </div>

            {/* Color picker */}
            <div>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2">Colour</p>
              <ColorPicker
                value={stat.color}
                onChange={(color) => {
                  const next = [...stats];
                  next[i] = { ...next[i], color };
                  setPortfolio((p) => ({ ...p, stats: next }));
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="mt-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-400/20 hover:border-cyan-300/30 rounded-full px-4 py-1.5"
          onClick={() =>
            setPortfolio((p) => ({
              ...p,
              stats: [...p.stats, { value: "0", label: "NEW STAT", color: "#7dd3fc" }],
            }))
          }
        >
          + Add stat
        </button>
      </AdminCard>

      <AdminSaveBar onSave={save} saving={saving} message={message} error={error} />
    </AdminPage>
  );
}
