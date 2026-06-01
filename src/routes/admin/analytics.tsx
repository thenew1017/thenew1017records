import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetAnalytics } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Eye, MousePointerClick, Users, TrendingUp, Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [{ title: "Admin · Analytics" }, { name: "robots", content: "noindex" }],
  }),
});

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  delta?: { label: string; value: number };
  icon: React.ComponentType<{ className?: string }>;
}) {
  const positive = (delta?.value ?? 0) >= 0;
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="font-display text-4xl uppercase mt-3 text-lux-white">{value}</p>
      {delta && (
        <p className={`mt-2 text-[11px] uppercase tracking-widest ${positive ? "text-emerald-400" : "text-destructive"}`}>
          {positive ? "▲" : "▼"} {Math.abs(delta.value)}% <span className="text-muted-foreground normal-case tracking-normal">{delta.label}</span>
        </p>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const fetchAnalytics = useServerFn(adminGetAnalytics);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchAnalytics(),
    refetchInterval: 30_000,
  });

  // Realtime: invalidate when new tracking events land
  useEffect(() => {
    const ch = supabase
      .channel("admin-analytics-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "artist_views" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "artist_clicks" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return (
    <AdminShell title="Analytics">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Live engagement across all artists. Last 30 days.</p>
        <span className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      {isLoading || !data ? (
        <p className="text-muted-foreground text-sm">Loading analytics…</p>
      ) : (
        <div className="space-y-8">
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Profile views"
              value={fmt(data.totals.views_30d)}
              delta={{ label: "vs prev period", value: percentDelta(data.totals.views_7d, data.totals.views_30d - data.totals.views_7d) }}
              icon={Eye}
            />
            <StatCard
              label="Link clicks"
              value={fmt(data.totals.clicks_30d)}
              delta={{ label: "vs prev period", value: percentDelta(data.totals.clicks_7d, data.totals.clicks_30d - data.totals.clicks_7d) }}
              icon={MousePointerClick}
            />
            <StatCard label="Unique sessions" value={fmt(data.totals.sessions_30d)} icon={Users} />
            <StatCard label="Published artists" value={data.totals.artists} icon={Trophy} />
          </div>

          {/* Time series */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl uppercase">Traffic · 30 days</h3>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> Views</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-foreground" /> Clicks</span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.days} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <Area type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={2} fill="url(#gradViews)" />
                  <Area type="monotone" dataKey="clicks" stroke="var(--foreground)" strokeWidth={2} fill="url(#gradClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard */}
            <div className="glass rounded-xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl uppercase flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" /> Leaderboard
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Top engagement · 30d</p>
              </div>
              {data.leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No engagement yet. Once visitors browse the site, top artists will appear here.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.leaderboard.map((a, i) => (
                    <li key={a.id} className="flex items-center gap-4 py-3">
                      <span className="font-display text-2xl text-muted-foreground w-8">{String(i + 1).padStart(2, "0")}</span>
                      <div className="h-12 w-12 overflow-hidden bg-secondary shrink-0">
                        {a.image_url ? <img src={a.image_url} alt={a.name} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.views_30d} views · {a.clicks_30d} clicks
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl">{a.engagement}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Trending */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xl uppercase flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-accent" /> Trending
              </h3>
              {data.trending.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No trending data yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.trending.map((a) => (
                    <li key={a.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden bg-secondary shrink-0">
                        {a.image_url ? <img src={a.image_url} alt={a.name} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground">{a.views_7d} views · 7d</p>
                      </div>
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {a.growth_pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Click breakdown */}
          <div className="glass rounded-xl p-6">
            <h3 className="font-display text-xl uppercase mb-4">Click destinations</h3>
            {data.click_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No outbound clicks yet.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.click_breakdown} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                    <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.click_breakdown.map((_, i) => (
                        <Cell key={i} fill="var(--accent)" fillOpacity={0.85 - i * 0.08} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function percentDelta(current: number, prev: number): number {
  if (prev <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}