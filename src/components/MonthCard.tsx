import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Calendar, Camera, ChevronDown, Heart, Sparkles, Trash2, Upload, Utensils, Video, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = kind === "photo" ? Camera : Video;
  const { isAdmin } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("month_media")
      .select("id, kind, storage_path")
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

  const pickFile = () => {
    setError(null);
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);

    const isVideo = file.type.startsWith("video/");
    const detectedKind = isVideo ? "video" : "photo";
    const ext = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase();
    const path = `m${month}-s${slot}-${crypto.randomUUID()}.${ext}`;

    if (item?.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
    }

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"), upsert: false });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      e.target.value = "";
      return;
    }

    if (item) {
      const { data, error: upErr2 } = await supabase
        .from("month_media")
        .update({ kind: detectedKind, storage_path: path })
        .eq("id", item.id)
        .select("id, kind, storage_path")
        .maybeSingle();
      setBusy(false);
      e.target.value = "";
      if (upErr2 || !data) {
        setError(upErr2?.message ?? "File uploaded but row update failed.");
        return;
      }
      setItem(data as MediaItem);
    } else {
      const { data, error: insErr } = await supabase
        .from("month_media")
        .insert({ month, slot, kind: detectedKind, storage_path: path })
        .select("id, kind, storage_path")
        .maybeSingle();
      setBusy(false);
      e.target.value = "";
      if (insErr || !data) {
        setError(insErr?.message ?? "File uploaded but insert failed.");
        return;
      }
      setItem(data as MediaItem);
    }
  };

  const remove = async () => {
    if (!item) return;
    setBusy(true);
    await supabase.from("month_media").delete().eq("id", item.id);
    await supabase.storage.from(BUCKET).remove([item.storage_path]);
    setItem(null);
    setBusy(false);
    setViewerOpen(false);
  };

  return (
    <div className="relative aspect-square">
      <input
        ref={inputRef}
        type="file"
        accept={kind === "photo" ? "image/*" : "video/*"}
        className="hidden"
        onChange={onFile}
      />
      <motion.div
        whileHover={{ scale: 1.05, borderColor: "var(--color-primary)" }}
        whileTap={{ scale: 0.97 }}
        className={`group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          item ? "border-transparent bg-card/40" : "border-border bg-card/40 text-muted-foreground hover:text-primary"
        }`}
        onClick={() => (item ? setViewerOpen(true) : pickFile())}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
        ) : item ? (
          kind === "photo" || item.kind === "photo" ? (
            <img
              src={mediaUrl(item.storage_path)}
              alt={`Month ${month} memory`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              src={mediaUrl(item.storage_path)}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Icon className="h-5 w-5" />
            <span className="text-[9px] uppercase tracking-[0.15em] opacity-60">
              {kind === "photo" ? "photo" : "video"}
            </span>
          </div>
        )}

        {item && isAdmin && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pickFile();
              }}
              className="rounded-full bg-white/90 p-2 text-foreground shadow-sm transition hover:bg-white"
              aria-label="Replace media"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove();
              }}
              disabled={busy}
              className="rounded-full bg-white/90 p-2 text-destructive shadow-sm transition hover:bg-white disabled:opacity-50"
              aria-label="Remove media"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {viewerOpen && item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewerOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl"
            >
              {item.kind === "photo" ? (
                <img
                  src={mediaUrl(item.storage_path)}
                  alt={`Month ${month} memory`}
                  className="max-h-[78vh] w-full object-contain"
                />
              ) : (
                <video
                  src={mediaUrl(item.storage_path)}
                  className="max-h-[78vh] w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              )}
              {isAdmin && (
                <div className="flex items-center justify-end gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      pickFile();
                      setViewerOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="absolute -bottom-1 left-1/2 z-10 w-40 -translate-x-1/2 translate-y-full rounded-lg bg-destructive px-2 py-1 text-center text-[10px] text-destructive-foreground">
          {error}
        </p>
      )}
    </div>
  );
}

export function MonthCard({ entry, index }: { entry: MonthEntry; index: number }) {
  const flipped = index % 2 === 1;
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="relative"
    >
      {/* connector dot */}
      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } },
        }}
        className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-[var(--shadow-petal)] md:block"
      >
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-primary/40"
        />
      </motion.div>

      <div
        className={`grid gap-6 md:grid-cols-2 md:gap-16 ${
          flipped ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Left */}
        <motion.div
          variants={fadeUp}
          className={`space-y-4 ${flipped ? "md:text-left" : "md:text-right"}`}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm">
            <span>Month {entry.month}</span>
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span>{entry.weeks}</span>
          </div>
          <motion.h3 variants={fadeUp} className="font-display text-4xl text-foreground sm:text-5xl">
            {entry.title}
          </motion.h3>
          <div className={`flex items-center gap-4 ${flipped ? "md:justify-start" : "md:justify-end"}`}>
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
              aria-hidden
            >
              {entry.sizeEmoji}
            </motion.div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Baby is the size of
              </div>
              <div className="font-display text-2xl text-primary">{entry.size}</div>
            </div>
          </div>
          <motion.p variants={fadeUp} className="text-base leading-relaxed text-foreground/80">
            {entry.notes}
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 pt-2">
            <Slot month={entry.month} slot={0} kind="photo" />
            <Slot month={entry.month} slot={1} kind="photo" />
            <Slot month={entry.month} slot={2} kind="video" />
          </motion.div>
        </motion.div>

        {/* Right */}
        <motion.div variants={fadeUp} className="space-y-4">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-full border border-border/60 bg-card/70 px-5 py-3 text-xs uppercase tracking-[0.25em] text-primary shadow-[var(--shadow-petal)] backdrop-blur-sm transition hover:bg-card md:hidden"
          >
            <span>{open ? "Hide details" : "Show details"}</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {(open || typeof window === "undefined") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 overflow-hidden md:!h-auto md:!opacity-100"
              >
                <Section icon={<Sparkles className="h-4 w-4" />} title="Milestones">
                  <ul className="space-y-1.5">
                    {entry.milestones.map((m, i) => (
                      <motion.li
                        key={m}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-2 text-sm text-foreground/80"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </Section>

                <Section icon={<Calendar className="h-4 w-4" />} title="Appointments">
                  <ul className="space-y-1.5">
                    {entry.appointments.map((a) => (
                      <li
                        key={a.label}
                        className="flex items-baseline justify-between gap-4 text-sm text-foreground/80"
                      >
                        <span>{a.label}</span>
                        <span className="font-display text-primary">{a.date}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Section icon={<Utensils className="h-4 w-4" />} title="Cravings">
                    <ul className="space-y-1 text-sm text-foreground/80">
                      {entry.cravings.map((c) => (
                        <li key={c}>· {c}</li>
                      ))}
                    </ul>
                  </Section>
                  <Section icon={<Heart className="h-4 w-4" />} title="Memory">
                    <p className="text-sm italic leading-relaxed text-foreground/80">
                      {entry.memories}
                    </p>
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.article>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 16px 40px -12px oklch(0.78 0.11 20 / 0.35)" }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-petal)] backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}
