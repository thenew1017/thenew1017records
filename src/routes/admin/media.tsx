import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListMedia, adminDeleteMedia } from "@/lib/cms.functions";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

function MediaAdmin() {
  const list = useServerFn(adminListMedia);
  const del = useServerFn(adminDeleteMedia);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adm-media"], queryFn: () => list() });
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const ext = f.name.split(".").pop() ?? "bin";
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, f, { cacheControl: "31536000" });
        if (error) throw error;

        // Retrieve public URL and output debug audit telemetry
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        console.log("=== MEDIA UPLOAD TELEMETRY AUDIT ===");
        console.log(`File Name:          ${f.name}`);
        console.log(`Storage Bucket:     media`);
        console.log(`Storage Path:       ${path}`);
        console.log(`Public URL:         ${publicUrl}`);
        console.log(`Database Record ID: NONE (Storage Asset)`);
        console.log("====================================");
      }
      qc.invalidateQueries({ queryKey: ["adm-media"] });
    } catch (err) {
      console.error("[Media Upload Error]:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally { 
      setUploading(false); 
    }
  };

  const remove = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await del({ data: { name } });
    qc.invalidateQueries({ queryKey: ["adm-media"] });
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url); setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AdminShell title="Media Library">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Upload and manage images. Click an image URL to copy it.</p>
        <label className="inline-flex items-center gap-2 cursor-pointer bg-lux-white text-background px-4 py-2 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-lux-cream">
          <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload files"}
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data?.files.map((f) => (
            <div key={f.name} className="glass rounded-lg overflow-hidden group">
              <div className="aspect-square bg-secondary">
                <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[10px] truncate text-muted-foreground" title={f.name}>{f.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => copy(f.url)} className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest bg-secondary hover:bg-accent hover:text-accent-foreground py-1.5 rounded">
                    {copied === f.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied === f.url ? "Copied" : "URL"}
                  </button>
                  <button onClick={() => remove(f.name)} className="p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}
          {data?.files.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-12">No files yet.</p>}
        </div>
      )}
    </AdminShell>
  );
}