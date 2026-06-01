import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin · The New 1017 Records" }, { name: "robots", content: "noindex" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotice("Account created. You can now sign in. The first user becomes admin automatically.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-secondary/40 to-background" />
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 md:p-10">
        <Link to="/" className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-accent">← Back to site</Link>
        <h1 className="font-display text-4xl uppercase mt-6">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage the site.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-secondary/60 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</label>
            <input
              type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-secondary/60 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-accent">{notice}</p>}

          <button type="submit" disabled={busy}
            className="w-full bg-lux-white text-background font-semibold uppercase tracking-[0.3em] text-xs py-4 rounded-md hover:bg-lux-cream transition-colors disabled:opacity-50">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Create the first admin account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}