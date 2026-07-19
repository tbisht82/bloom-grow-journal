import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Calendar, Camera, ChevronDown, Heart, Sparkles, Trash2, Upload, Utensils, Video, Volume2, VolumeX, X } from "lucide-react";
import type { MonthEntry } from "@/lib/months";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

type MediaItem = {
  id: string;
  kind: "photo" | "video";
  storage_path: string;
  muted: boolean;
};

const BUCKET = "month_media";

function mediaUrl(path: string) {
  const base = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

function Slot({
  month,
  slot,
  kind,
}: {
  month: number;
  slot: number;
  kind: "photo" | "video";
}) {
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [includeAudio, setIncludeAudio] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = kind === "photo" ? Camera : Video;
  const { isAdmin } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("month_media")
      .select("id, kind, storage_path, muted")
      .eq("month", month)
      .eq("slot", slot)
      .maybeSingle();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setItem((data as MediaItem | null) ?? null);
  }, [month, slot]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!item) return;
    setBusy(true);
    setError(null);
    const { error: delErr } = await supabase.storage
      .from(BUCKET)
      .remove([item.storage_path]);
    if (delErr) {
      setBusy(false);
      setError(delErr.message);
      return;
    }
    const { error: rowErr } = await supabase
      .from("month_media")
      .delete()
      .eq("id", item.id);
    setBusy(false);
    if (rowErr) {
      setError(rowErr.message);
      return;
    }
    setItem(null);
  };

  const pickFile = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${month}/${slot}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (upErr) {
      setBusy(false);
      setError(upErr.message);
      return;
    }
    const row = {
      month,
      slot,
      kind,
      storage_path: path,
      muted: kind === "video" ? !includeAudio : false,
    };
    const { data, error: rowErr } = await supabase
      .from("month_media")
      .upsert(row, { onConflict: "month,slot" })
      .select("id, kind, storage_path, muted")
      .maybeSingle();
    setBusy(false);
    if (rowErr || !data) {
      setError(rowErr?.message ?? "Upload failed");
      return;
    }
    setItem(data as MediaItem);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (kind === "video") {
      setPendingVideo(f);
      setViewerOpen(true);
      return;
    }
    upload(f);
    e.target.value = "";
  };

  const confirmVideoUpload = async () => {
    if (!pendingVideo) return;
    setViewerOpen(false);
    await upload(pendingVideo);
    setPendingVideo(null);
    setIncludeAudio(true);
  };

  const cancelVideoUpload = () => {
    setViewerOpen(false);
    setPendingVideo(null);
    setIncludeAudio(true);
  };

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-secondary/10">
      <input
        ref={inputRef}
        type="file"
        accept={kind === "photo" ? "image/*" : "video/*"}
        onChange={onFile}
        className="hidden"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}

      {!loading && !item && (
        <button
          type="button"
          onClick={pickFile}
          disabled={busy}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground transition hover:bg-secondary/20 disabled:opacity-50"
        >
          <Icon className="h-6 w-6 transition group-hover:scale-110" />
          <span className="text-[10px] uppercase tracking-[0.2em]">
            {kind === "photo" ? "Photo" : "Video"}
          </span>
        </button>
      )}

      {!loading && item && (
        <>
          {item.kind === "photo" ? (
            <img
              src={mediaUrl(item.storage_path)}
              alt={`Month ${month} ${kind}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              src={`${mediaUrl(item.storage_path)}#t=0.1`}
              className="h-full w-full object-cover"
              muted={item.muted}
              playsInline
              preload="metadata"
            />
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="rounded-full bg-background/80 p-3 text-foreground shadow-md"
              aria-label="View"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-destructive shadow-md transition hover:bg-background disabled:opacity-50"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}

      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute bottom-2 left-2 right-2 rounded-md bg-destructive/90 px-2 py-1 text-center text-[10px] text-destructive-foreground">
          {error}
        </div>
      )}

      <AnimatePresence>
        {viewerOpen && item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={() => setViewerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-full max-w-2xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-2 text-foreground shadow-md"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              {item.kind === "photo" ? (
                <img
                  src={mediaUrl(item.storage_path)}
                  alt={`Month ${month}`}
                  className="max-h-[85vh] w-full object-contain"
                />
              ) : (
                <video
                  src={mediaUrl(item.storage_path)}
                  className="max-h-[85vh] w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  muted={item.muted}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewerOpen && pendingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={cancelVideoUpload}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity:0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-display text-lg">Preview</h4>
              <video
                src={URL.createObjectURL(pendingVideo)}
                className="mt-3 max-h-[50vh] w-full rounded-xl"
                controls
                autoPlay
                playsInline
                muted={!includeAudio}
              />
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                />
                Include audio
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelVideoUpload}
                  className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmVideoUpload}
                  disabled={busy}
                  className="rounded-full bg-primary/90 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlotGroup({
  month,
  kind,
  title,
  icon: Icon,
}: {
  month: number;
  kind: "photo" | "video";
  title: string;
  icon: typeof Camera;
}) {
  return (
    <div className="group relative">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((slot) => (
          <Slot key={slot} month={month} slot={slot} kind={kind} />
        ))}
      </div>
    </div>
  );
}

export function MonthCard({
  month,
  entry,
  index,
}: {
  month: number;
  entry: MonthEntry;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-petal)] backdrop-blur-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Month {month}</span>
          </div>
          <h3 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">{entry.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.blurb}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary/20 hover:text-foreground"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-5">
              <SlotGroup month={month} kind="photo" title="Photos" icon={Camera} />
              <SlotGroup month={month} kind="video" title="Videos" icon={Video} />

              <div className="rounded-2xl border border-border/60 bg-secondary/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Cravings
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.cravings.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Highlights
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {entry.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{h}</span>
    ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
