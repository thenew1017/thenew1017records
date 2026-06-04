import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { adminGetVisitorAnalytics } from "@/lib/cms.functions";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from "recharts";
import { 
  Users, Activity, Clock, Globe, Monitor, Smartphone, Tablet, 
  Search, RefreshCw, Layers 
} from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsAdmin,
  head: () => ({ meta: [{ title: "Admin · Visitor Analytics" }, { name: "robots", content: "noindex" }] }),
});

function formatDuration(ms: number) {
  if (!ms || ms < 0) return "0m 0s";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function AnalyticsAdmin() {
  const getAnalyticsFn = useServerFn(adminGetVisitorAnalytics);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adm-visitor-analytics"],
    queryFn: () => getAnalyticsFn(),
    refetchInterval: 30000,
  });

  const [search, setSearch] = useState("");

  const filteredVisitors = useMemo(() => {
    if (!data?.visitors) return [];
    return data.visitors.filter(v => 
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.visitors, search]);

  return (
    <AdminShell title="Visitor Analytics">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-display uppercase tracking-widest text-white">Traffic Overview</h2>
          <p className="text-muted-foreground font-mono text-xs mt-1">Real-time global visitor metrics.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={`group relative flex items-center gap-2 px-5 py-2.5 border rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
            isFetching 
              ? "border-[#FFD700]/50 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)] scale-95"
              : "border-white/10 hover:border-[#FFD700]/80 bg-white/[0.02] hover:bg-[#FFD700]/10 hover:shadow-[0_0_25px_rgba(255,215,0,0.25)] text-muted-foreground hover:text-[#FFD700]"
          }`}
        >
          <RefreshCw className={`h-4 w-4 transition-transform duration-700 ${isFetching ? "animate-spin text-[#FFD700]" : "group-hover:rotate-180"}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
            {isFetching ? "Syncing..." : "Sync"}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin mb-4" />
          <p className="font-mono text-[10px] uppercase tracking-widest">Aggregating Matrix Data...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700 relative z-10">
          
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Visitors" 
              value={data?.overview.totalVisitors ?? 0} 
              icon={<Users className="w-4 h-4 text-[#FFD700]" />} 
            />
            <StatCard 
              title="Returning Guests" 
              value={data?.overview.returningVisitors ?? 0} 
              icon={<RefreshCw className="w-4 h-4 text-emerald-400" />} 
            />
            <StatCard 
              title="Active Now" 
              value={data?.overview.activeVisitors ?? 0} 
              icon={<Activity className="w-4 h-4 text-red-500 animate-pulse" />} 
              pulse
            />
            <StatCard 
              title="Avg Session" 
              value={formatDuration(data?.overview.avgSessionDuration ?? 0)} 
              icon={<Clock className="w-4 h-4 text-blue-400" />} 
            />
          </div>

          {/* Traffic Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Traffic (Last 30 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.traffic ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,215,0,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#FFD700" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                  <Area type="monotone" dataKey="views" stroke="rgba(255,255,255,0.3)" fillOpacity={0} strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Three Column Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Top Pages */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Most Viewed Content
              </h3>
              <div className="space-y-4">
                {data?.topPages.slice(0,5).map((page, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-white font-mono truncate mr-4 max-w-[70%]">{page.name}</span>
                    <span className="text-[#FFD700] font-bold">{page.count}</span>
                  </div>
                ))}
                {(!data?.topPages || data.topPages.length === 0) && (
                  <div className="text-xs text-muted-foreground">No page data yet.</div>
                )}
              </div>
            </div>

            {/* Geography */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Globe className="w-3 h-3" /> Top Locations
              </h3>
              <div className="space-y-4">
                {data?.geography.slice(0,5).map((geo, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-white font-mono truncate">{geo.location}</span>
                    <span className="text-[#FFD700] font-bold">{geo.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Monitor className="w-3 h-3" /> Device Split
              </h3>
              <div className="space-y-6 mt-6">
                <DeviceRow icon={<Smartphone />} label="Mobile" count={data?.device.mobile ?? 0} total={data?.overview.totalVisitors ?? 1} />
                <DeviceRow icon={<Monitor />} label="Desktop" count={data?.device.desktop ?? 0} total={data?.overview.totalVisitors ?? 1} />
                <DeviceRow icon={<Tablet />} label="Tablet" count={data?.device.tablet ?? 0} total={data?.overview.totalVisitors ?? 1} />
              </div>
            </div>

          </div>

          {/* Visitor Ledger */}
          <div className="bg-white/[0.01] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-white font-bold">Visitor Ledger</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search Visitor ID or Location"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Visitor ID</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">First Visit</th>
                    <th className="px-6 py-4">Last Active</th>
                    <th className="px-6 py-4 text-right">Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVisitors.slice(0, 50).map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{v.id.split('_')[1] || v.id.substring(0,8)}...</td>
                      <td className="px-6 py-4">{v.country}</td>
                      <td className="px-6 py-4">{v.device}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(v.first_visit).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white">{new Date(v.last_visit).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#FFD700]">{v.visit_count}</td>
                    </tr>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-mono">No visitors found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filteredVisitors.length > 50 && (
                <div className="px-6 py-4 text-center text-[10px] font-mono text-muted-foreground bg-white/[0.01] border-t border-white/5">
                  Showing latest 50 results.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatCard({ title, value, icon, pulse }: { title: string; value: string | number; icon: React.ReactNode; pulse?: boolean }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 shadow-lg">
      {pulse && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-2xl rounded-full animate-pulse" />}
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
        <div className="p-2 bg-black/40 rounded-lg border border-white/5 shadow-inner">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-display text-white tracking-wide">{value}</div>
    </div>
  );
}

function DeviceRow({ icon, label, count, total }: { icon: React.ReactNode; label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="text-muted-foreground w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white">{label}</span>
          <span className="text-muted-foreground font-mono">{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#FFD700] rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}