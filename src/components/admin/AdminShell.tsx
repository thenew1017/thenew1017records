import { Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, LogOut, Users, Image as ImageIcon, Home, Mail, LayoutDashboard, BarChart3, FileText, Music, Sparkles } from "lucide-react";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/artists", label: "Artists", icon: Users },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/releases", label: "Releases", icon: Music },
  { to: "/admin/founder-spotlight", label: "Founder Spotlight", icon: Sparkles },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/applications", label: "Applications", icon: FileText },
];

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();
  const check = useServerFn(checkIsAdmin);
  const [authState, setAuthState] = useState<"checking" | "ok" | "denied">("checking");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    check({ data: { token: session?.access_token } })
      .then((r) => setAuthState(r.isAdmin ? "ok" : "denied"))
      .catch(() => setAuthState("denied"));
  }, [session, user, loading, check, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/admin/login" });
  };

  if (loading || authState === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-xs uppercase tracking-[0.4em]">
        Loading admin…
      </main>
    );
  }
  if (authState === "denied") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 px-4 text-center">
        <h1 className="font-display text-4xl uppercase">Access denied</h1>
        <p className="text-sm text-muted-foreground max-w-md">This account does not have admin permissions.</p>
        <button onClick={signOut} className="text-xs uppercase tracking-[0.3em] underline">Sign out</button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col transition-transform`}>
        <div className="px-6 py-6 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">The New 1017</p>
          <h2 className="font-display text-2xl uppercase mt-1 text-lux-white">CMS</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${active ? "bg-lux-white text-background font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/" className="block text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-accent px-2">View site →</Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive px-2 py-2">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 glass-strong border-b border-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2"><Menu className="h-5 w-5" /></button>
          <h1 className="font-display text-2xl uppercase">{title}</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2"><X className="h-5 w-5 opacity-0" /></button>
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}