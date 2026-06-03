import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  adminListArtists, 
  adminUpsertArtist, 
  adminDeleteArtist,
  getArtistMediaGallery,
  adminUpsertGalleryImage,
  adminDeleteGalleryImage
} from "@/lib/cms.functions";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Upload, X, Image, Star, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/artists")({
  component: ArtistsAdmin,
  head: () => ({ meta: [{ title: "Admin · Artists" }, { name: "robots", content: "noindex" }] }),
});

type Artist = {
  id?: string;
  name: string;
  role: string | null;
  tag: string | null;
  bio: string | null;
  image_url: string | null;
  spotify_url: string | null;
  apple_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  sort_order: number;
  published: boolean;
};

const EMPTY: Artist = {
  name: "", role: "", tag: "", bio: "", image_url: "",
  spotify_url: "", apple_url: "", youtube_url: "",
  instagram_url: "", twitter_url: "", website_url: "",
  sort_order: 0, published: true,
};

function ArtistsAdmin() {
  const list = useServerFn(adminListArtists);
  const upsert = useServerFn(adminUpsertArtist);
  const del = useServerFn(adminDeleteArtist);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adm-artists"], queryFn: () => list() });
  const [editing, setEditing] = useState<Artist | null>(null);
  const [galleryArtist, setGalleryArtist] = useState<{ id: string; name: string } | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this artist?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["adm-artists"] });
  };

  return (
    <AdminShell title="Artists">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Manage roster, bios, music & social links.</p>
        <button onClick={() => setEditing(EMPTY)} className="inline-flex items-center gap-2 bg-lux-white text-background px-4 py-2 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-lux-cream">
          <Plus className="h-4 w-4" /> New artist
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.artists.map((a) => (
            <div key={a.id} className="glass rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-secondary relative">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs uppercase">No image</div>
                )}
                {!a.published && <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest px-2 py-1 rounded">Hidden</span>}
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{a.role || "—"}</p>
                <h3 className="font-display text-2xl uppercase mt-1 text-lux-white">{a.name}</h3>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditing(a as Artist)} className="inline-flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.15em] bg-secondary hover:bg-accent hover:text-accent-foreground py-2 px-2.5 rounded-md flex-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => setGalleryArtist({ id: a.id!, name: a.name })} className="inline-flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.15em] bg-secondary hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] py-2 px-2.5 rounded-md flex-1">
                    <Image className="h-3 w-3" /> Gallery
                  </button>
                  <button onClick={() => onDelete(a.id!)} className="inline-flex items-center justify-center px-2.5 text-destructive hover:bg-destructive/10 py-2 rounded-md">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data?.artists.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-12">No artists yet. Create your first one.</p>
          )}
        </div>
      )}

      {editing && (
        <ArtistForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (a) => {
            await upsert({ data: a as never });
            qc.invalidateQueries({ queryKey: ["adm-artists"] });
            setEditing(null);
          }}
        />
      )}

      {galleryArtist && (
        <MediaGalleryManager
          artistId={galleryArtist.id}
          artistName={galleryArtist.name}
          onClose={() => setGalleryArtist(null)}
        />
      )}
    </AdminShell>
  );
}

function ArtistForm({ initial, onClose, onSave }: { initial: Artist; onClose: () => void; onSave: (a: Artist) => Promise<void> }) {
  const [a, setA] = useState<Artist>(() => {
    const [tagVal] = (initial.tag || "").split("|");
    return { ...initial, tag: tagVal || "" };
  });
  const [rating, setRating] = useState<number>(() => {
    const [, ratingVal] = (initial.tag || "").split("|");
    return ratingVal ? parseInt(ratingVal) : 5;
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof Artist>(k: K, v: Artist[K]) => setA((s) => ({ ...s, [k]: v }));

  const upload = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `artists/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, cacheControl: "31536000" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      set("image_url", publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      // Strip empty strings → null for url fields
      const clean: Artist = { ...a };
      // Serialise rating inside tag field
      clean.tag = `${a.tag || ""}|${rating}`;
      const urlKeys: (keyof Artist)[] = ["image_url","spotify_url","apple_url","youtube_url","instagram_url","twitter_url","website_url","role","tag","bio"];
      for (const k of urlKeys) if (clean[k] === "") (clean as Record<string, unknown>)[k] = null;
      await onSave(clean);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl uppercase text-lux-white">{a.id ? "Edit artist" : "New artist"}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name *"><input required value={a.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
            <Field label="Role"><input value={a.role ?? ""} onChange={(e) => set("role", e.target.value)} className={inputCls} placeholder="Flagship Artist" /></Field>
            <Field label="Tag (e.g. 01)"><input value={a.tag ?? ""} onChange={(e) => set("tag", e.target.value)} className={inputCls} /></Field>
            <Field label="Sort order"><input type="number" value={a.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className={inputCls} /></Field>
            <Field label="Rating (1 - 5 Stars)">
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value) || 5)} className={inputCls}>
                <option value="5">⭐⭐⭐⭐⭐ (5 / 5)</option>
                <option value="4">⭐⭐⭐⭐ (4 / 5)</option>
                <option value="3">⭐⭐⭐ (3 / 5)</option>
                <option value="2">⭐⭐ (2 / 5)</option>
                <option value="1">⭐ (1 / 5)</option>
              </select>
            </Field>
          </div>

          <Field label="Bio"><textarea rows={3} value={a.bio ?? ""} onChange={(e) => set("bio", e.target.value)} className={inputCls} /></Field>

          <div className="grid grid-cols-1 gap-6">
            <Field label="Image">
              <div className="flex items-center gap-4">
                {a.image_url && <img src={a.image_url} alt="" className="h-20 w-20 object-cover rounded-md border border-border" />}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md text-xs uppercase tracking-[0.2em]">
                  <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
                {a.image_url && <button type="button" onClick={() => set("image_url", "")} className="text-xs text-destructive underline">remove</button>}
              </div>
              <input value={a.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} className={`${inputCls} mt-2`} placeholder="or paste image URL" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Spotify URL"><input type="url" value={a.spotify_url ?? ""} onChange={(e) => set("spotify_url", e.target.value)} className={inputCls} /></Field>
            <Field label="Apple Music URL"><input type="url" value={a.apple_url ?? ""} onChange={(e) => set("apple_url", e.target.value)} className={inputCls} /></Field>
            <Field label="YouTube URL"><input type="url" value={a.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value)} className={inputCls} /></Field>
            <Field label="Instagram URL"><input type="url" value={a.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} className={inputCls} /></Field>
            <Field label="Twitter / X URL"><input type="url" value={a.twitter_url ?? ""} onChange={(e) => set("twitter_url", e.target.value)} className={inputCls} /></Field>
            <Field label="Website URL"><input type="url" value={a.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} className={inputCls} /></Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={a.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-current" />
            <span className="text-sm">Published (visible on site)</span>
          </label>
        </div>

        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="mt-8 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-6 py-3 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" disabled={busy || uploading} className="bg-lux-white text-background px-6 py-3 rounded-md text-xs uppercase tracking-[0.3em] font-semibold hover:bg-lux-cream disabled:opacity-50">
            {busy ? "Saving…" : "Save artist"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-secondary/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

type GalleryImage = {
  id?: string;
  artist_id: string;
  image_url: string;
  caption: string | null;
  credit: string | null;
  category: "Press Photo" | "Performance" | "Studio Session" | "Behind The Scenes" | "Lifestyle";
  sort_order: number;
  featured: boolean;
};

function MediaGalleryManager({ artistId, artistName, onClose }: { artistId: string; artistName: string; onClose: () => void }) {
  const getGallery = useServerFn(getArtistMediaGallery);
  const upsertImg = useServerFn(adminUpsertGalleryImage);
  const deleteImg = useServerFn(adminDeleteGalleryImage);
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adm-artist-gallery", artistId],
    queryFn: () => getGallery({ data: { artistId } }),
  });
  
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Omit<GalleryImage, "artist_id">>({
    image_url: "",
    caption: "",
    credit: "",
    category: "Press Photo",
    sort_order: 0,
    featured: false
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `gallery/${artistId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, cacheControl: "31536000" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      setNewItem(prev => ({ ...prev, image_url: publicUrl }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.image_url) {
      setErr("Image URL is required.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        id: editingId || undefined,
        artist_id: artistId,
        image_url: newItem.image_url,
        caption: newItem.caption || "",
        credit: newItem.credit || "",
        category: newItem.category,
        sort_order: newItem.sort_order,
        featured: newItem.featured
      };
      await upsertImg({ data: payload });
      refetch();
      setNewItem({
        image_url: "",
        caption: "",
        credit: "",
        category: "Press Photo",
        sort_order: (data?.gallery?.length ?? 0) + 1,
        featured: false
      });
      setEditingId(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save image record failed");
    } finally {
      setBusy(false);
    }
  };

  const handleEditClick = (item: GalleryImage) => {
    setEditingId(item.id || null);
    setNewItem({
      image_url: item.image_url,
      caption: item.caption || "",
      credit: item.credit || "",
      category: item.category,
      sort_order: item.sort_order,
      featured: item.featured
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return;
    try {
      await deleteImg({ data: { id } });
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleMove = async (item: GalleryImage, direction: "up" | "down") => {
    const list = [...(data?.gallery ?? [])];
    const index = list.findIndex(i => i.id === item.id);
    if (index === -1) return;
    
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    
    const currentOrder = item.sort_order;
    const targetItem = list[swapIndex];
    const targetOrder = targetItem.sort_order;
    
    try {
      setBusy(true);
      await Promise.all([
        upsertImg({ data: { ...item, sort_order: targetOrder } }),
        upsertImg({ data: { ...targetItem, sort_order: currentOrder } })
      ]);
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Media Gallery Manager</span>
            <h2 className="font-display text-3xl uppercase text-lux-white">{artistName}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <form onSubmit={handleSaveItem} className="lg:col-span-5 space-y-4 bg-secondary/20 p-5 rounded-2xl border border-white/5 h-fit text-left">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/90">
              {editingId ? "Edit Gallery Image" : "Add Gallery Image"}
            </h3>

            <Field label="Upload Image">
              <div className="flex flex-col gap-3">
                {newItem.image_url ? (
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-border">
                    <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setNewItem(prev => ({ ...prev, image_url: "" }))} 
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/70 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-white/10 hover:border-white/20 bg-black/20 rounded-lg aspect-[4/3] flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-white transition-all">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-xs">{uploading ? "Uploading…" : "Upload Photo"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                  </label>
                )}
                <input 
                  value={newItem.image_url} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))} 
                  className={inputCls} 
                  placeholder="or paste image URL" 
                />
              </div>
            </Field>

            <Field label="Caption">
              <input 
                value={newItem.caption || ""} 
                onChange={(e) => setNewItem(prev => ({ ...prev, caption: e.target.value }))} 
                className={inputCls} 
                placeholder="Image description..." 
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Credit">
                <input 
                  value={newItem.credit || ""} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, credit: e.target.value }))} 
                  className={inputCls} 
                  placeholder="Photographer..." 
                />
              </Field>
              <Field label="Category">
                <select 
                  value={newItem.category} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as any }))} 
                  className={inputCls}
                >
                  <option value="Press Photo">Press Photo</option>
                  <option value="Performance">Performance</option>
                  <option value="Studio Session">Studio Session</option>
                  <option value="Behind The Scenes">Behind The Scenes</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <Field label="Sort Order">
                <input 
                  type="number" 
                  value={newItem.sort_order} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} 
                  className={inputCls} 
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                <input 
                  type="checkbox" 
                  checked={newItem.featured} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, featured: e.target.checked }))} 
                  className="h-4 w-4 accent-[#D4AF37]" 
                />
                <span className="text-xs text-white/70">Featured Photo</span>
              </label>
            </div>

            {err && <p className="text-xs text-destructive">{err}</p>}

            <div className="pt-2 flex gap-2">
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingId(null);
                    setNewItem({ image_url: "", caption: "", credit: "", category: "Press Photo", sort_order: (data?.gallery?.length ?? 0), featured: false });
                  }} 
                  className="px-4 py-2 bg-secondary text-white/80 hover:text-white rounded-md text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={busy || uploading} 
                className="flex-grow bg-lux-white text-background px-4 py-2 rounded-md text-xs uppercase tracking-wider font-semibold hover:bg-lux-cream disabled:opacity-50"
              >
                {busy ? "Saving…" : editingId ? "Save Changes" : "Add New Photo"}
              </button>
            </div>
          </form>

          <div className="lg:col-span-7 space-y-4 text-left">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">
              Gallery Images ({data?.gallery?.length ?? 0})
            </h3>

            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading gallery…</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {data?.gallery?.map((item: GalleryImage, idx: number) => (
                  <div key={item.id} className="glass rounded-xl overflow-hidden border border-white/5 bg-black/40 flex flex-col">
                    
                    <div className="aspect-[4/3] bg-secondary/20 relative">
                      <img src={item.image_url} alt={item.caption || ""} className="absolute inset-0 w-full h-full object-cover" />
                      
                      {item.featured && (
                        <span className="absolute top-2 right-2 bg-[#D4AF37]/90 text-background text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="h-2 w-2 fill-background stroke-background" /> Featured
                        </span>
                      )}

                      <span className="absolute bottom-2 left-2 bg-black/60 border border-white/10 text-white/70 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-sm backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-white font-medium line-clamp-1">{item.caption || "No caption"}</p>
                        {item.credit && <p className="text-[9px] text-white/40 font-mono tracking-wider">Credit: {item.credit}</p>}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="flex gap-1">
                          <button 
                            type="button" 
                            disabled={idx === 0} 
                            onClick={() => handleMove(item, "up")} 
                            className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            type="button" 
                            disabled={idx === (data?.gallery?.length ?? 1) - 1} 
                            onClick={() => handleMove(item, "down")} 
                            className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleEditClick(item)} 
                            className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest bg-secondary hover:bg-accent px-2 py-1 rounded"
                          >
                            <Pencil className="h-2.5 w-2.5" /> Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteClick(item.id!)} 
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                {(!data?.gallery || data.gallery.length === 0) && (
                  <p className="text-xs text-muted-foreground col-span-full text-center py-12">
                    No images in this artist's gallery yet. Upload or paste one on the left.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}