export const adminInputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30";

export function AdminPage({ title, subtitle, children, actions }) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono-display text-[10px] tracking-[0.35em] uppercase text-cyan-400/90 mb-2">
            Admin
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">{subtitle}</p>
          )}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}

export function AdminCard({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-background p-5 sm:p-6 mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.6),_0_0_20px_rgba(0,229,255,0.06),_0_0_35px_rgba(157,76,221,0.06),_inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_30px_rgba(0,229,255,0.12),_0_0_45px_rgba(157,76,221,0.12),_inset_0_1px_1px_rgba(255,255,255,0.15)] ${className}`}
    >
      {title && (
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

export function AdminField({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="contact-label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </label>
  );
}

export function AdminSaveBar({ onSave, saving, message, error }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 px-4 py-4 mt-8 border-t border-white/10 bg-background/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3 justify-between">
        <div className="text-sm min-h-[1.25rem]">
          {message && <span className="text-cyan-400">{message}</span>}
          {error && <span className="text-destructive">{error}</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/95 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/** Save button at the bottom of each admin card (Skills, Projects, Blogs, etc.) */
export function AdminCardSave({ onSave, saving, message, error, saveLocked }) {
  const isDisabled = Boolean(saveLocked && !saving);

  return (
    <div className="mt-5 pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-xs min-h-[1.125rem]" aria-live="polite">
        {message && (
          <span className={message === "Saving…" ? "text-muted-foreground" : "text-cyan-400"}>
            {message}
          </span>
        )}
        {error && <span className="text-destructive">{error}</span>}
      </div>
      <button
        type="button"
        onClick={() => onSave?.()}
        disabled={isDisabled}
        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white/95 disabled:opacity-60 shrink-0 self-end sm:self-auto"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

export function AdminListActions({ onArchive, onDelete, archived, onMoveUp, onMoveDown }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {onArchive && (
        <button
          type="button"
          onClick={onArchive}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-white/10 rounded-full px-3 py-1"
        >
          {archived ? "Restore" : "Archive"}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-medium text-destructive/90 hover:text-destructive border border-destructive/20 rounded-full px-3 py-1"
        >
          Delete
        </button>
      )}
      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-white/10 rounded-full px-3 py-1"
        >
          ↑ Move Up
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-white/10 rounded-full px-3 py-1"
        >
          ↓ Move Down
        </button>
      )}
    </div>
  );
}
