import { usePortfolio } from "../context/PortfolioContext";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaYoutube,
  FaInstagram,
  FaSnapchat,
  FaReddit,
  FaDiscord,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import GlassCard from "./GlassCard";

const socialIcons = {
  github: FaGithub,
  linkedin: FaLinkedin,
  mail: FaEnvelope,
  youtube: FaYoutube,
  instagram: FaInstagram,
  snapchat: FaSnapchat,
  x: FaXTwitter,
  reddit: FaReddit,
  discord: FaDiscord,
};

function BrandDomain({ domain }) {
  const dot = domain.indexOf(".");
  if (dot === -1) return <span className="font-display font-semibold">{domain}</span>;
  return (
    <span className="font-display font-semibold tracking-tight">
      <span className="text-foreground">{domain.slice(0, dot)}</span>
      <span className="text-[#b8a8ff]">{domain.slice(dot)}</span>
    </span>
  );
}

export default function Footer() {
  const { portfolio } = usePortfolio();
  const { site, social } = portfolio;
  const footer = portfolio.footer ?? { tagline: "", navigate: [], designedIn: "", shippedFrom: "" };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const year = new Date().getFullYear();

  return (
    <footer className="page-container relative pb-12 sm:pb-16 md:pb-20 pt-6 sm:pt-8">
      <p className="footer-watermark pointer-events-none select-none" aria-hidden>
        {site.name.toUpperCase()}
      </p>

      <GlassCard className="footer-card relative z-10 overflow-hidden p-5 sm:p-8 md:p-10 lg:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.7fr] gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <button
              type="button"
              onClick={() => scrollTo("home")}
              className="flex items-center gap-3 text-left"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full font-display font-bold text-sm text-slate-950"
                style={{
                  background: "linear-gradient(135deg, #7dd3fc, #c4b5fd)",
                }}
              >
                {site.initials}
              </span>
              <BrandDomain domain={site.domain} />
            </button>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">
              {footer.tagline}
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p className="font-mono-display text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-5">
              Navigate
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {(footer.navigate ?? []).map((column) => (
                <ul key={column.map((l) => l.id).join("-")} className="space-y-2">
                  {column.map(({ id, label }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => scrollTo(id)}
                        className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Elsewhere */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-mono-display text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-5">
              Elsewhere
            </p>
            <ul className="flex gap-3">
              {social.map(({ label, href, icon }) => {
                const Icon = socialIcons[icon] ?? FaEnvelope;
                return (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-foreground/70 hover:text-foreground hover:border-cyan-500/35 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono-display text-[11px] sm:text-xs text-muted-foreground">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p>
            {footer.designedIn} • Shipped from{" "}
            <span className="text-foreground font-medium">{footer.shippedFrom}</span>
          </p>
        </div>
      </GlassCard>
    </footer>
  );
}
