import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteMessage,
  fetchMessages,
  updateMessage,
} from "../api/client";
import { HiArchiveBox, HiInbox, HiTrash, HiCheck, HiXMark } from "react-icons/hi2";
import { AdminCard, AdminPage } from "../components/AdminUi";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(null); // null | "archive" | "delete"
  const [error, setError] = useState("");

  // Reset selected messages when switching tabs
  useEffect(() => {
    setSelectedIds([]);
    setSelectionMode(null);
  }, [archived]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
  };

  const bulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateMessage(id, { archived: !archived, status: "read" }))
      );
      setSelectedIds([]);
      setSelectionMode(null);
      load();
    } catch (e) {
      setError(e.message || "Failed to archive messages");
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete these ${selectedIds.length} messages permanently?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteMessage(id)));
      setSelectedIds([]);
      setSelectionMode(null);
      load();
    } catch (e) {
      setError(e.message || "Failed to delete messages");
      setLoading(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMessages(archived);
      setMessages(data);
    } catch (e) {
      setError(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [archived]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset selected message when switching tabs
  useEffect(() => {
    setSelectedId(null);
  }, [archived]);

  const selected = messages.find((m) => m.id === selectedId);

  const markRead = async (id) => {
    await updateMessage(id, { status: "read" });
    load();
  };

  const toggleArchive = async (id, current) => {
    await updateMessage(id, { archived: !current, status: "read" });
    setSelectedId(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this message permanently?")) return;
    await deleteMessage(id);
    setSelectedId(null);
    load();
  };

  return (
    <AdminPage
      title="Contact messages"
      subtitle="Every contact form submission appears here as a message."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setArchived(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors cursor-pointer select-none ${
              !archived
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            Inbox
          </button>
          <button
            type="button"
            onClick={() => setArchived(true)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors cursor-pointer select-none ${
              archived
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Bulk Action Controls on the Right */}
        {messages.length > 0 && !loading && (
          <div className="flex items-center gap-2">
            {selectionMode === null ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectionMode("archive")}
                  title={archived ? "Restore bulk" : "Archive bulk"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors"
                >
                  {archived ? <HiInbox className="h-4.5 w-4.5" /> : <HiArchiveBox className="h-4.5 w-4.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode("delete")}
                  title="Delete bulk"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                >
                  <HiTrash className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground font-mono mr-1 select-none">
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={selectionMode === "archive" ? bulkArchive : bulkDelete}
                  disabled={selectedIds.length === 0}
                  title={`Confirm ${selectionMode === "archive" ? (archived ? "Restore" : "Archive") : "Delete"}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-white/95 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <HiCheck className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode(null);
                    setSelectedIds([]);
                  }}
                  title="Cancel selection"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading messages…</p>}

      {!loading && messages.length === 0 && (
        <AdminCard>
          <p className="text-sm text-muted-foreground">
            {archived ? "No archived messages." : "No messages yet. Submissions from the contact form will appear here."}
          </p>
        </AdminCard>
      )}

      {/* Select All Toggle - Only visible in Selection Mode */}
      {selectionMode !== null && messages.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-4">
          <input
            id="select-all"
            type="checkbox"
            checked={messages.length > 0 && selectedIds.length === messages.length}
            onChange={toggleSelectAll}
            className="h-4.5 w-4.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
          />
          <label htmlFor="select-all" className="text-xs font-mono-display tracking-wider text-muted-foreground uppercase cursor-pointer select-none">
            Select All ({selectedIds.length}/{messages.length} selected)
          </label>
        </div>
      )}

      {!loading && messages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                if (selectionMode !== null) {
                  toggleSelect(m.id);
                } else {
                  setSelectedId(m.id);
                  if (m.status === "unread") markRead(m.id);
                }
              }}
              className={`text-left rounded-xl border p-5 transition-all shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer ${
                selectionMode !== null
                  ? selectedIds.includes(m.id)
                    ? "border-cyan-500/50 bg-cyan-500/[0.03]"
                    : "border-white/10 hover:border-white/15"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 pr-6">
                    {selectionMode !== null && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        readOnly
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                      />
                    )}
                    <span className="text-base font-semibold text-foreground font-display group-hover:text-cyan-300 transition-colors">
                      {m.name}
                    </span>
                  </div>
                  {/* Unread status badge glow */}
                  {m.status === "unread" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  )}
                </div>
                <p className={`text-xs text-muted-foreground truncate mt-1.5 ${selectionMode !== null ? "pl-7" : ""}`}>
                  {m.email}
                </p>
                <p className={`text-xs text-foreground/75 mt-3 line-clamp-3 leading-relaxed ${selectionMode !== null ? "pl-7" : ""}`}>
                  {m.message}
                </p>
              </div>

              <div className={`mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground font-mono ${selectionMode !== null ? "pl-7" : ""}`}>
                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                {selectionMode === null && (
                  <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Read message →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Message Overlay */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl z-10"
            >
              <AdminCard className="!mb-0 shadow-[0_20px_50px_rgba(0,0,0,0.7),_0_0_30px_rgba(157,76,221,0.06)] border border-white/10 relative">
                
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors cursor-pointer select-none font-bold"
                  aria-label="Close message"
                >
                  ✕
                </button>

                <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pr-8">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {selected.name}
                    </h2>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-cyan-400/90 hover:underline break-all"
                    >
                      {selected.email}
                    </a>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      {new Date(selected.createdAt).toLocaleString()}
                      {selected.status === "unread" && (
                        <span className="ml-2 text-cyan-400 font-semibold">• unread</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleArchive(selected.id, selected.archived)}
                      className="text-xs rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {selected.archived ? "Restore to inbox" : "Archive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(selected.id)}
                      className="text-xs rounded-full border border-destructive/30 text-destructive px-3 py-1.5 hover:bg-destructive/10 cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="font-mono-display text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
                  Message
                </p>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[45vh] overflow-y-auto">
                  {selected.message}
                </div>
              </AdminCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
