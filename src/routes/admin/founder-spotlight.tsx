import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetFounderSpotlight, adminSaveFounderSpotlight } from "@/lib/cms.functions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/admin/founder-spotlight")({
  component: FounderSpotlightAdmin,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

type FounderSpotlightData = {
  id?: string;
  founder_name: string;
  founder_title: string;
  founder_badge: string;
  founder_description: string;
  stat_1_label: string;
  stat_1_value: string;
  stat_2_label: string;
  stat_2_value: string;
  stat_3_label: string;
  stat_3_value: string;
  founder_image_url: string;
  founder_image_alt: string;
  is_visible: boolean;
};

const DEFAULT_SPOTLIGHT: FounderSpotlightData = {
  founder_name: "Gucci Mane",
  founder_title: "Gucci Mane",
  founder_badge: "1017 FOUNDER // A&R CHIEF",
  founder_description: "Gucci Mane is the visionary architect of modern trap music. By establishing 1017 Records, he built an elite talent incubator that pioneered soundwaves and launched global careers. With deep instinctual expertise, he continues to identify, sign, and launch independent artists onto the world stage, making the 1017 Records network the ultimate launchpad.",
  stat_1_label: "Signed Alumni",
  stat_1_value: "12+",
  stat_2_label: "Streams Built",
  stat_2_value: "5B+",
  stat_3_label: "Careers Run",
  stat_3_value: "PLATINUM",
  founder_image_url: "",
  founder_image_alt: "Gucci Mane Founder Showcase",
  is_visible: true,
};

function FounderSpotlightAdmin() {
  const getFn = useServerFn(adminGetFounderSpotlight);
  const saveFn = useServerFn(adminSaveFounderSpotlight);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adm-founder-spotlight"],
    queryFn: () => getFn(),
  });

  const [form, setForm] = useState<FounderSpotlightData>(DEFAULT_SPOTLIGHT);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setForm({ ...DEFAULT_SPOTLIGHT, ...data.data });
    }
  }, [data]);

  const update = <K extends keyof FounderSpotlightData>(k: K, v: FounderSpotlightData[K]) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `founder/spotlight-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      update("founder_image_url", publicUrl);
    } catch (err) {
      console.error("[Founder Spotlight Upload Error]:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = () => {
    update("founder_image_url", "");
  };

  const handleSave = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await saveFn({ data: form });
      qc.invalidateQueries({ queryKey: ["adm-founder-spotlight"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      setSaved(true);
    } catch (err) {
      console.error("[Founder Spotlight Save Error]:", err);
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Founder Spotlight">
        <p className="text-muted-foreground text-sm">Loading Spotlight Dossier…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Founder Spotlight Settings">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure the legendary Founder Spotlight section displayed on the secure talent Directive Roster page.
        </p>

        {/* Section Visibility Toggle */}
        <div className="flex items-center gap-2.5 mb-4 bg-secondary/30 p-3.5 rounded-md border border-border">
          <input
            type="checkbox"
            id="spotlight-visible"
            checked={form.is_visible}
            onChange={(e) => update("is_visible", e.target.checked)}
            className="rounded border-border bg-secondary text-accent focus:ring-accent focus:ring-offset-background h-4 w-4"
          />
          <label htmlFor="spotlight-visible" className="text-xs uppercase tracking-[0.25em] text-foreground font-semibold cursor-pointer select-none">
            Show Founder Spotlight Section on Page
          </label>
        </div>

        {form.is_visible && (
          <div className="space-y-6 bg-secondary/10 p-5 rounded-md border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Founder Name">
                <input
                  value={form.founder_name}
                  onChange={(e) => update("founder_name", e.target.value)}
                  className={cls}
                  placeholder="e.g. Gucci Mane"
                />
              </Field>
              <Field label="Founder Title / Role">
                <input
                  value={form.founder_title}
                  onChange={(e) => update("founder_title", e.target.value)}
                  className={cls}
                  placeholder="e.g. Founder & A&R Chief"
                />
              </Field>
            </div>

            <Field label="Founder Verified Badge / Header Label">
              <input
                value={form.founder_badge}
                onChange={(e) => update("founder_badge", e.target.value)}
                className={cls}
                placeholder="e.g. 1017 FOUNDER // A&R CHIEF"
              />
            </Field>

            <Field label="Founder Biography / Editorial Description">
              <textarea
                rows={4}
                value={form.founder_description}
                onChange={(e) => update("founder_description", e.target.value)}
                className={cls}
                placeholder="Describe the founder's legacy and label narrative..."
              />
            </Field>

            {/* Achievement Statistics */}
            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Spotlight Achievement Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Stat 1 Value"><input value={form.stat_1_value} onChange={(e) => update("stat_1_value", e.target.value)} className={cls} placeholder="e.g. 12+" /></Field>
                <Field label="Stat 1 Label"><input value={form.stat_1_label} onChange={(e) => update("stat_1_label", e.target.value)} className={cls} placeholder="e.g. Signed Alumni" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Stat 2 Value"><input value={form.stat_2_value} onChange={(e) => update("stat_2_value", e.target.value)} className={cls} placeholder="e.g. 5B+" /></Field>
                <Field label="Stat 2 Label"><input value={form.stat_2_label} onChange={(e) => update("stat_2_label", e.target.value)} className={cls} placeholder="e.g. Streams Built" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Stat 3 Value"><input value={form.stat_3_value} onChange={(e) => update("stat_3_value", e.target.value)} className={cls} placeholder="e.g. PLATINUM" /></Field>
                <Field label="Stat 3 Label"><input value={form.stat_3_label} onChange={(e) => update("stat_3_label", e.target.value)} className={cls} placeholder="e.g. Careers Run" /></Field>
              </div>
            </div>

            {/* Image Casing */}
            <Field label="Founder Portrait Image">
              <div className="flex flex-col gap-4 mt-1">
                <div className="flex items-center gap-4">
                  {form.founder_image_url ? (
                    <div className="relative group/img">
                      <img src={form.founder_image_url} alt={form.founder_image_alt} className="h-28 w-28 object-cover rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-[8px] font-bold opacity-90 shadow-md cursor-pointer"
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 w-28 bg-black/40 rounded-md border border-dashed border-border flex items-center justify-center text-[10px] font-mono uppercase text-muted-foreground select-none text-center p-2">
                      No Image Set (Using Fallback)
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md text-xs uppercase tracking-[0.2em] transition-colors">
                    <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload Portrait"}
                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                </div>
                <input value={form.founder_image_url} onChange={(e) => update("founder_image_url", e.target.value)} className={cls} placeholder="or paste absolute custom image URL" />
              </div>
            </Field>

            <Field label="Founder Image Alt Text Description">
              <input
                value={form.founder_image_alt}
                onChange={(e) => update("founder_image_alt", e.target.value)}
                className={cls}
                placeholder="e.g. Gucci Mane Portrait"
              />
            </Field>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border mt-6">
          <button onClick={handleSave} disabled={busy} className="bg-accent text-accent-foreground px-6 py-3 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-yellow-400 disabled:opacity-50 shadow-md cursor-pointer">
            {busy ? "Saving…" : "Publish Spotlight"}
          </button>
          {saved && <span className="text-sm text-accent">Published ✓</span>}
        </div>
      </div>
    </AdminShell>
  );
}

const cls = "w-full bg-secondary/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent font-light";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">{label}</span><div className="mt-1">{children}</div></label>;
}
