import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Loader as Loader2, Sparkles, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  author_name: string;
  caption: string | null;
  storage_path: string;
  created_at: string;
};

const BUCKET = "memories";

function publicUrl(path: string) {
  const base = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 86_400_000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function MemoryWall() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [active, setActive] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("memory_photos")
      .select("id, author_name, caption, storage_path, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) {
      setError(error.message);
    } else {
      setPhotos((data ?? []) as Photo[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = () => fileInputRef.current?.click();

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data, error: dbErr } = await supabase
      .from("memory_photos")
      .insert({
        author_name: name.trim(),
        caption: caption.trim() || null,
        storage_path: path,
      })
      .select("id, author_name, caption, storage_path, created_at")
      .maybeSingle();
    setUploading(false);
    if (dbErr || !data) {
      setError(dbErr?.message ?? "Upload saved but couldn't be listed. Please refresh.");
      return;
    }
    setPhotos((prev) => [data as Photo, ...prev]);
    setFile(null);
    setCaption("");
  };

  const remove = async (photo: Photo) => {
    const prev = photos;
    setPhotos((cur) => cur.filter((p) => p.id !== photo.id));
    setActive(null);
    await supabase.from("memory_photos").delete().eq("id", photo.id);
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    void prev;
  };

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 h-px w-16 bg-primary/40" />
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Memory Wall</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          A living gallery of moments — bump photos, nursery corners, ultrasound glimpses. Add a
          memory for the little one.
        </p>
      </motion.div>

      <motion.form
        onSubmit={upload}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-petal)] backdrop-blur-sm sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={pickFile}
            className="group flex aspect-square w-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected preview"
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={60}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional) — 'first kick', 'nursery nook'…"
              maxLength={120}
              className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="mt-auto flex items-center gap-3">
              <motion.button
                type="submit"
                disabled={uploading || !file || !name.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-[var(--shadow-petal)] transition disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Add memory
              </motion.button>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.form>

      {error && (
        <p className="mx-auto mt-4 max-w-xl rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center"
          >
            <ImagePlus className="mx-auto mb-3 h-6 w-6 text-primary/60" />
            <p className="font-display text-xl italic text-foreground/70">
              No memories yet — the wall is waiting.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Upload the first one above.</p>
          </motion.div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 md:columns-4 [&>*]:mb-4">
            <AnimatePresence>
              {photos.map((p, i) => (
                <motion.figure
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
                  className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-[var(--shadow-petal)] backdrop-blur-sm"
                >
                  <button
                    type="button"
                    onClick={() => setActive(p)}
                    className="block w-full"
                    aria-label="View memory"
                  >
                    <img
                      src={publicUrl(p.storage_path)}
                      alt={p.caption ?? `Memory from ${p.author_name}`}
                      loading="lazy"
                      className="w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </button>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                    {p.caption && (
                      <p className="text-sm italic text-white/95">{p.caption}</p>
                    )}
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/80">
                      {p.author_name} · {timeAgo(p.created_at)}
                    </p>
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl"
            >
              <img
                src={publicUrl(active.storage_path)}
                alt={active.caption ?? `Memory from ${active.author_name}`}
                className="max-h-[78vh] w-full object-contain"
              />
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  {active.caption && (
                    <p className="font-display text-xl italic text-foreground">{active.caption}</p>
                  )}
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {active.author_name} · {timeAgo(active.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => remove(active)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
