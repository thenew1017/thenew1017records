import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetSettings, adminSetSetting } from "@/lib/cms.functions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageAdmin,
  head: () => ({ meta: [{ title: "Admin · Homepage" }, { name: "robots", content: "noindex" }] }),
});

type Hero = { eyebrow: string; title: string; subtitle: string; cta_label: string; cta_href: string; banner_url: string };
const HERO_DEFAULT: Hero = { eyebrow: "Est. 2017", title: "A New Era of Sound", subtitle: "Where Culture, Talent And Legacy Converge.", cta_label: "Watch The Film", cta_href: "#music", banner_url: "" };

type ShowcaseSetting = {
  enabled: boolean;
  image_url: string;
  title: string;
  subtitle: string;
  description: string;
  button_label: string;
  button_url: string;
};
const SHOWCASE_DEFAULT: ShowcaseSetting = {
  enabled: false,
  image_url: "",
  title: "Turn Your Music",
  subtitle: "Into Momentum.",
  description: "Submit your sound, build your audience, and connect with opportunities across the modern music industry.",
  button_label: "Submit Your Sound",
  button_url: "/about-1017"
};

function HomepageAdmin() {
  const get = useServerFn(adminGetSettings);
  const set = useServerFn(adminSetSetting);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adm-settings"], queryFn: () => get() });

  const [hero, setHero] = useState<Hero>(HERO_DEFAULT);
  const [showcase, setShowcase] = useState<ShowcaseSetting>(SHOWCASE_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingShowcase, setUploadingShowcase] = useState(false);

  useEffect(() => {
    if (data?.settings.hero) setHero({ ...HERO_DEFAULT, ...(data.settings.hero as object) });
    if (data?.settings.showcase) setShowcase({ ...SHOWCASE_DEFAULT, ...(data.settings.showcase as object) });
  }, [data]);

  const update = <K extends keyof Hero>(k: K, v: Hero[K]) => setHero((s) => ({ ...s, [k]: v }));
  const updateShowcase = <K extends keyof ShowcaseSetting>(k: K, v: ShowcaseSetting[K]) => setShowcase((s) => ({ ...s, [k]: v }));

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `homepage/banner-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      update("banner_url", publicUrl);
    } catch (err) {
      console.error("[Homepage Upload Error]:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally { 
      setUploading(false); 
    }
  };

  const uploadShowcaseImage = async (file: File) => {
    setUploadingShowcase(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `homepage/showcase-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      updateShowcase("image_url", publicUrl);
    } catch (err) {
      console.error("[Showcase Upload Error]:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally { 
      setUploadingShowcase(false); 
    }
  };

  const deleteShowcaseImage = () => {
    updateShowcase("image_url", "");
  };

  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      await Promise.all([
        set({ data: { key: "hero", value: hero } }),
        set({ data: { key: "showcase", value: showcase } })
      ]);
      qc.invalidateQueries({ queryKey: ["adm-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      setSaved(true);
    } finally { setBusy(false); }
  };

  if (isLoading) return <AdminShell title="Homepage"><p className="text-muted-foreground text-sm">Loading…</p></AdminShell>;

  return (
    <AdminShell title="Homepage">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground">Edit the hero banner content visible on the homepage.</p>

        <Field label="Eyebrow"><input value={hero.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} className={cls} /></Field>
        <Field label="Title"><input value={hero.title} onChange={(e) => update("title", e.target.value)} className={cls} /></Field>
        <Field label="Subtitle"><textarea rows={2} value={hero.subtitle} onChange={(e) => update("subtitle", e.target.value)} className={cls} /></Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="CTA label"><input value={hero.cta_label} onChange={(e) => update("cta_label", e.target.value)} className={cls} /></Field>
          <Field label="CTA href"><input value={hero.cta_href} onChange={(e) => update("cta_href", e.target.value)} className={cls} /></Field>
        </div>

        <Field label="Banner image">
          <div className="flex items-center gap-4">
            {hero.banner_url && <img src={hero.banner_url} alt="" className="h-24 w-40 object-cover rounded-md border border-border" />}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md text-xs uppercase tracking-[0.2em]">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload banner"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
          <input value={hero.banner_url} onChange={(e) => update("banner_url", e.target.value)} className={`${cls} mt-2`} placeholder="or paste image URL" />
        </Field>

        <div className="flex items-center gap-4 pt-2">
          <button onClick={save} disabled={busy} className="bg-lux-white text-background px-6 py-3 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-lux-cream disabled:opacity-50">
            {busy ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-accent">Saved ✓</span>}
        </div>

        <hr className="border-border my-8" />

        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-accent flex items-center gap-2">
            <span>⚙️ //</span> Homepage Showcase Banner Manager
          </h2>
          <p className="text-xs text-muted-foreground">Manage the secondary visual showcase banner (e.g. "Built In The Dark" section) on your homepage.</p>
        </div>

        <div className="flex items-center gap-2.5 mb-4 bg-secondary/30 p-3.5 rounded-md border border-border">
          <input
            type="checkbox"
            id="showcase-enable"
            checked={showcase.enabled}
            onChange={(e) => updateShowcase("enabled", e.target.checked)}
            className="rounded border-border bg-secondary text-accent focus:ring-accent focus:ring-offset-background h-4 w-4"
          />
          <label htmlFor="showcase-enable" className="text-xs uppercase tracking-[0.25em] text-foreground font-semibold cursor-pointer select-none">
            Enable Custom Showcase Banner
          </label>
        </div>

        {showcase.enabled && (
          <div className="space-y-6 bg-secondary/10 p-5 rounded-md border border-white/5">
            <Field label="Main Heading"><input value={showcase.title} onChange={(e) => updateShowcase("title", e.target.value)} className={cls} placeholder="e.g. BUILT IN THE DARK" /></Field>
            <Field label="Secondary Heading"><input value={showcase.subtitle} onChange={(e) => updateShowcase("subtitle", e.target.value)} className={cls} placeholder="e.g. DELIVERED WORLDWIDE" /></Field>
            <Field label="Dossier Description Subtitle"><textarea rows={3} value={showcase.description} onChange={(e) => updateShowcase("description", e.target.value)} className={cls} placeholder="Sub-copy or descriptive manifesto details..." /></Field>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="CTA Button Text"><input value={showcase.button_label} onChange={(e) => updateShowcase("button_label", e.target.value)} className={cls} placeholder="e.g. Watch The Film" /></Field>
              <Field label="CTA Button Link URL"><input value={showcase.button_url} onChange={(e) => updateShowcase("button_url", e.target.value)} className={cls} placeholder="e.g. #releases or https://..." /></Field>
            </div>

            <Field label="Showcase Background Image / Film Cover">
              <div className="flex flex-col gap-4 mt-1">
                <div className="flex items-center gap-4">
                  {showcase.image_url ? (
                    <div className="relative group/img">
                      <img src={showcase.image_url} alt="Showcase Preview" className="h-28 w-48 object-cover rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={deleteShowcaseImage}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-[8px] font-bold opacity-90 shadow-md"
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 w-48 bg-black/40 rounded-md border border-dashed border-border flex items-center justify-center text-[10px] font-mono uppercase text-muted-foreground select-none">
                      No Image Set (Using Fallback)
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md text-xs uppercase tracking-[0.2em] transition-colors">
                    <Upload className="h-4 w-4" /> {uploadingShowcase ? "Uploading…" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadShowcaseImage(e.target.files[0])} />
                  </label>
                </div>
                <input value={showcase.image_url} onChange={(e) => updateShowcase("image_url", e.target.value)} className={`${cls}`} placeholder="or paste absolute custom image URL" />
              </div>
            </Field>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border mt-6">
          <button onClick={save} disabled={busy} className="bg-accent text-accent-foreground px-6 py-3 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-yellow-400 disabled:opacity-50 shadow-md">
            {busy ? "Saving…" : "Publish Changes"}
          </button>
          {saved && <span className="text-sm text-accent">Published ✓</span>}
        </div>
      </div>
    </AdminShell>
  );
}

const cls = "w-full bg-secondary/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}