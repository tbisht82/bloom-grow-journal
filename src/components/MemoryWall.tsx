import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, X } from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";

type Photo = {
  id: string;
  src: string; // data URL
  caption: string;
  addedAt: number;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// crude compression: draw to canvas at max width
async function compress(dataUrl: string, maxW = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

export function MemoryWall() {
  const [photos, setPhotos] = useLocalState<Photo[]>("journal.memoryWall", []);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const additions: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const raw = await readAsDataUrl(file);
        const compressed = await compress(raw);
        additions.push({
          id: crypto.randomUUID(),
          src: compressed,
          caption: "",
          addedAt: Date.now(),
        });
      } catch {
        /* ignore */
      }
    }
    if (additions.length) setPhotos([...additions, ...photos]);
  };

  const remove = (id: string) => setPhotos(photos.filter((p) => p.id !== id));
  const caption = (id: string, caption: string) =>
    setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)));

  // masonry-ish spans for bento feel
  const spans = ["", "row-span-2", "", "col-span-2", "", "row-span-2", "", ""];

  return (
    <section id="memories" className="mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            our little archive
          </p>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Memory Wall</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Bump photos, ultrasound scans, cravings caught on camera. Drop them here and they'll
            live on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-[var(--shadow-leaf)] transition hover:bg-primary/90"
        >
          <ImagePlus className="h-4 w-4" /> Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </motion.div>

      {photos.length === 0 ? (
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="font-display text-xl italic">
            drop your first memory here
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em]">jpg · png · webp</span>
        </motion.button>
      ) : (
        <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          <AnimatePresence initial={false}>
            {photos.map((p, i) => (
              <motion.figure
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-leaf)] ${spans[i % spans.length]}`}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(p)}
                  className="block h-full w-full"
                >
                  <img
                    src={p.src}
                    alt={p.caption || "memory"}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground opacity-0 shadow transition hover:text-destructive group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {p.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 font-display text-sm italic text-white">
                    {p.caption}
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              layoutId={lightbox.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl"
            >
              <img src={lightbox.src} alt={lightbox.caption} className="max-h-[70vh] w-full object-contain bg-black/5" />
              <div className="p-4">
                <input
                  value={lightbox.caption}
                  onChange={(e) => {
                    caption(lightbox.id, e.target.value);
                    setLightbox({ ...lightbox, caption: e.target.value });
                  }}
                  placeholder="add a caption…"
                  className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-display italic text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 rounded-full bg-background/80 p-2 text-foreground shadow hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
