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
import { usePortfolio } from "../context/PortfolioContext";

const icons = {
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

export default function SocialSidebar() {
  const { portfolio } = usePortfolio();
  const social = portfolio.social ?? [];

  return (
    <aside
      className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-5"
      aria-label="Social links"
    >
      <span className="font-mono-display text-[10px] tracking-[0.35em] uppercase text-muted-foreground [writing-mode:vertical-lr] rotate-180">
        Follow
      </span>
      <span className="w-px h-12 bg-white/15" />
      <ul className="flex flex-col gap-3">
        {social.map(({ label, href, icon }) => {
          const Icon = icons[icon] ?? FaEnvelope;
          return (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/80 hover:text-foreground hover:border-cyan-500/40 hover:glow-cyan transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
