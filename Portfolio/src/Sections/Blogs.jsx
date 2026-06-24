import { usePortfolio } from "../context/PortfolioContext";
import SectionHeader from "../Components/SectionHeader";
import GlassCard from "../Components/GlassCard";
import ProxyErrorSymbol from "../Components/ProxyErrorSymbol";

export default function Blogs() {
  const { portfolio, fromApi } = usePortfolio();
  const blogs = portfolio.blogs ?? [];

  return (
    <section id="blog" className="page-container section-pad relative">
      <SectionHeader
        eyebrow="BLOG"
        title={{ before: "Thoughts & ", highlight: "notes", after: "." }}
        subtitle="Writing about what I learn while building."
      />
      {!fromApi ? (
        <GlassCard className="flex flex-col items-center justify-center text-center p-10 py-16 border border-dashed border-white/10 hover:border-cyan-500/20 transition-all duration-300">
          <ProxyErrorSymbol />
          <h3 className="font-display text-2xl font-bold text-foreground">No items found!</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Backend database is unreachable due to a proxy error.
          </p>
        </GlassCard>
      ) : (
        <ul className="space-y-4">
          {blogs.map((post) => (
            <li key={post.title}>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="block group">
                <GlassCard className="p-6 transition-colors group-hover:bg-white/[0.06]">
                  <p className="font-mono-display text-xs text-muted-foreground">{post.date}</p>
                  <h3 className="font-display text-lg font-semibold mt-2 group-hover:text-gradient transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2">{post.excerpt}</p>
                </GlassCard>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
