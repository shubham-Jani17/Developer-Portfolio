import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/client";

const links = [
  { to: "/admin", end: true, label: "Dashboard" },
  { to: "/admin/about", label: "About" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/experience", label: "Experience" },
  { to: "/admin/blogs", label: "Blogs" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await logoutAdmin(); // Tell backend to clear the HttpOnly cookie
    } catch {
      // Even if the request fails, redirect anyway
    }
    navigate("/admin/login");
  };

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? "http://localhost:3001";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(0,229,255,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(157,76,221,0.1), transparent 60%)",
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-50" />
      </div>

      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-400/80">
              Portfolio
            </p>
            <p className="font-display font-semibold text-foreground">Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={logout}
              className="text-xs font-medium rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5"
            >
              Log out
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer select-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 lg:gap-10">
        <nav className={`lg:w-48 shrink-0 flex flex-col gap-1 transition-all duration-300 ${menuOpen ? "block border-b border-white/5 pb-4 mb-2 lg:border-none lg:pb-0 lg:mb-0" : "hidden lg:flex"}`}>
          {links.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0 pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
