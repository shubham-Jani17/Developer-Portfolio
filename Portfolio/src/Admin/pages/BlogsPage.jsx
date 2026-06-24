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
  return `blog-${crypto.randomUUID().slice(0, 8)}`;
}

export default function BlogsPage() {
  const { portfolio, loading, saving, setPortfolio, save, isSaving, cardStatus } =
    useAdminPortfolio();
  if (loading || !portfolio) return <p className="text-muted-foreground">Loading…</p>;

  const { blogs } = portfolio;

  const updateBlog = (i, patch) => {
    const next = [...blogs];
    next[i] = { ...next[i], ...patch };
    setPortfolio((p) => ({ ...p, blogs: next }));
  };

  return (
    <AdminPage
      title="Blogs"
      subtitle="Edit each post and save from its card. Changes sync to the public portfolio."
      actions={
        <button
          type="button"
          onClick={() =>
            setPortfolio((p) => ({
              ...p,
              blogs: [
                {
                  id: newId(),
                  title: "New post",
                  excerpt: "",
                  url: "",
                  date: new Date().toISOString().slice(0, 10),
                  archived: false,
                },
                ...p.blogs,
              ],
            }))
          }
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
        >
          + New post
        </button>
      }
    >
      {blogs.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">No blog posts yet.</p>
      )}

      {blogs.map((blog, i) => {
        const scope = `blog-${blog.id || i}`;
        return (
          <AdminCard
            key={blog.id || i}
            title={
              <span className="flex items-center gap-2">
                {blog.title}
                {blog.archived && (
                  <span className="text-[10px] font-mono uppercase text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">
                    Archived
                  </span>
                )}
              </span>
            }
          >
            {["title", "excerpt", "url", "date"].map((key) => (
              <AdminField key={key} label={key}>
                {key === "excerpt" ? (
                  <textarea
                    className={`${adminInputClass} min-h-[60px]`}
                    value={blog[key] ?? ""}
                    onChange={(e) => updateBlog(i, { [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={adminInputClass}
                    value={blog[key] ?? ""}
                    onChange={(e) => updateBlog(i, { [key]: e.target.value })}
                  />
                )}
              </AdminField>
            ))}
            <AdminListActions
              archived={blog.archived}
              onArchive={() => updateBlog(i, { archived: !blog.archived })}
              onDelete={() => {
                const next = {
                  ...portfolio,
                  blogs: blogs.filter((_, idx) => idx !== i),
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
