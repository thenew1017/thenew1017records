import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListSubscribers, adminDeleteSubscriber } from "@/lib/cms.functions";
import { Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubsAdmin,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

function SubsAdmin() {
  const list = useServerFn(adminListSubscribers);
  const del = useServerFn(adminDeleteSubscriber);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adm-subs"], queryFn: () => list() });

  const remove = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["adm-subs"] });
  };

  const exportCsv = () => {
    const rows = ["email,created_at", ...(data?.subscribers ?? []).map((s) => `${s.email},${s.created_at}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "subscribers.csv"; a.click();
  };

  return (
    <AdminShell title="Newsletter Subscribers">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{data?.subscribers.length ?? 0} subscribers</p>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 bg-lux-white text-background px-4 py-2 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-lux-cream">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Subscribed</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {data?.subscribers.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 text-lux-white">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(s.id)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground p-2 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {data?.subscribers.length === 0 && <tr><td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}