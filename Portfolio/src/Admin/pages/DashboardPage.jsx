import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnalytics, fetchMessages } from "../api/client";
import useAdminPortfolio from "../hooks/useAdminPortfolio";
import DashboardStatCard from "../components/DashboardStatCard";
import { AdminCard, AdminPage } from "../components/AdminUi";

export default function DashboardPage() {
  const { portfolio, loading } = useAdminPortfolio();
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    lastViewAt: null,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchMessages()
      .then(setMessages)
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchAnalytics()
        .then((data) => {
          if (!cancelled) setAnalytics(data);
        })
        .catch(() => {
          if (!cancelled) setAnalytics({ totalViews: 0, uniqueVisitors: 0, lastViewAt: null });
        })
        .finally(() => {
          if (!cancelled) setAnalyticsLoading(false);
        });
    };
    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading || !portfolio) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  const unread = messages.filter((m) => m.status === "unread").length;
  const activeProjects = portfolio.projects?.filter((p) => !p.archived).length ?? 0;
  const lastVisitLabel = analytics.lastViewAt
    ? new Date(analytics.lastViewAt).toLocaleString()
    : "No visits yet";

  return (
    <AdminPage
      title="Dashboard"
      subtitle="Overview of portfolio traffic, projects, and messages."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStatCard
          label="Portfolio visits"
          value={analytics.totalViews}
          loading={analyticsLoading}
          hint="Each time someone opens your public site (per tab session)"
        >
          <p className="text-[11px] text-muted-foreground/90 mt-3 font-mono-display">
            Last visit: {lastVisitLabel}
          </p>
        </DashboardStatCard>

        <DashboardStatCard
          label="Unique visitors"
          value={analytics.uniqueVisitors}
          loading={analyticsLoading}
          accent="violet"
          hint="Distinct browsers (stored locally on each device)"
        />

        <DashboardStatCard
          label="Unread messages"
          value={unread}
          loading={false}
          hint="Contact form inbox"
        >
          <Link
            to="/messages"
            className="text-xs text-cyan-400/90 hover:underline mt-2 inline-block"
          >
            Open inbox →
          </Link>
        </DashboardStatCard>

        <DashboardStatCard
          label="Active projects"
          value={activeProjects}
          loading={false}
          accent="violet"
        >
          <Link
            to="/projects"
            className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-block"
          >
            Manage projects →
          </Link>
        </DashboardStatCard>
      </div>

      <AdminCard title="Recent messages">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {messages.slice(0, 5).map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>{m.name}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground/90 mt-2 line-clamp-2">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminPage>
  );
}
