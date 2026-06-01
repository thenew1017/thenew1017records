import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListArtists, adminListSubscribers } from "@/lib/cms.functions";
import { Users, Mail, Image as ImageIcon, Home, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Admin · Dashboard" }, { name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const listArtists = useServerFn(adminListArtists);
  const listSubs = useServerFn(adminListSubscribers);
  const a = useQuery({ queryKey: ["adm-artists"], queryFn: () => listArtists() });
  const s = useQuery({ queryKey: ["adm-subs"], queryFn: () => listSubs() });

  const stats = [
    { label: "Artists", value: a.data?.artists.length ?? "—", to: "/admin/artists", icon: Users },
    { label: "Subscribers", value: s.data?.subscribers.length ?? "—", to: "/admin/subscribers", icon: Mail },
    { label: "Analytics", value: "Live", to: "/admin/analytics", icon: BarChart3 },
    { label: "Homepage", value: "Edit", to: "/admin/homepage", icon: Home },
    { label: "Media", value: "Manage", to: "/admin/media", icon: ImageIcon },
  ];

  return (
    <AdminShell title="Dashboard">
      <p className="text-muted-foreground mb-8 text-sm">Welcome back. Quick overview of your site.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <Link key={st.label} to={st.to} className="glass rounded-xl p-6 hover:border-accent transition-colors">
              <Icon className="h-5 w-5 text-accent mb-4" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{st.label}</p>
              <p className="font-display text-4xl uppercase mt-2 text-lux-white">{st.value}</p>
            </Link>
          );
        })}
      </div>
    </AdminShell>
  );
}
