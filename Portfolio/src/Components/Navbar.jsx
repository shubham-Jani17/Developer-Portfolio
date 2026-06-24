import { useEffect, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";
import { usePortfolio } from "../context/PortfolioContext";
import { useTheme } from "../hooks/useTheme";
import OverlayMenu from "./OverlayMenu";

function BrandDomain({ domain }) {
  const dot = domain.indexOf(".");
  if (dot === -1) {
    return <span className="font-display font-semibold text-foreground">{domain}</span>;
  }
  const name = domain.slice(0, dot);
  const tld = domain.slice(dot);
  return (
    <span className="font-display font-semibold tracking-tight">
      <span className="text-foreground">{name}</span>
      <span className="text-[#b8a8ff]">{tld}</span>
    </span>
  );
}

export default function Navbar() {
  const { portfolio } = usePortfolio();
  const { site } = portfolio;
  const navLinks = portfolio.navLinks ?? [];
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("about");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", ...navLinks.map((l) => l.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navLinks]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-2 sm:gap-3 rounded-full border px-2 py-2 sm:px-3 sm:py-2.5 transition-colors duration-200 backdrop-blur-md ${
            dark
              ? scrolled
                ? "border-white/12 bg-[linear-gradient(135deg,rgba(12,18,35,0.95)_0%,rgba(28,18,48,0.95)_50%,rgba(12,22,40,0.95)_100%)] shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
                : "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.88)_0%,rgba(32,22,52,0.9)_45%,rgba(14,24,42,0.88)_100%)] shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
              : scrolled
                ? "border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.95)_100%)] shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
                : "border-slate-200/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(241,245,249,0.92)_100%)] shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
          }`}
          aria-label="Main navigation"
        >
          {/* Brand */}
          <button
            type="button"
            onClick={() => scrollTo("home")}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 pl-1 sm:pl-2"
          >
            <span
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full font-display font-bold text-sm text-slate-950 shadow-inner"
              style={{
                background: "linear-gradient(135deg, #7dd3fc 0%, #c4b5fd 55%, #a78bfa 100%)",
              }}
            >
              {site.initials}
            </span>
            <span className="hidden sm:block">
              <BrandDomain domain={site.domain} />
            </span>
          </button>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={`px-3 xl:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeId === id
                      ? dark
                        ? "text-white bg-white/10"
                        : "text-slate-900 bg-slate-900/8"
                      : dark
                        ? "text-white/85 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 pr-1 sm:pr-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-colors ${
                dark
                  ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {dark ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/95 transition-colors shadow-sm"
            >
              Let&apos;s talk
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden />
            </button>

            <button
              type="button"
              className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-full border ${
                dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"
              }`}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className="flex flex-col gap-1.5">
                <span className={`block w-4 h-0.5 rounded-full ${dark ? "bg-white" : "bg-slate-800"}`} />
                <span className={`block w-4 h-0.5 rounded-full ${dark ? "bg-white" : "bg-slate-800"}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={scrollTo} />
    </>
  );
}