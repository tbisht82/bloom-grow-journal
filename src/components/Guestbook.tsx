import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader as Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Entry = {
  id: string;
  author_name: string;
  message: string;
  relationship: string | null;
  created_at: string;
};

const AVATAR_PALETTE = [
  "oklch(0.85 0.07 25)",
  "oklch(0.83 0.08 150)",
  "oklch(0.83 0.08 240)",
  "oklch(0.82 0.09 300)",
  "oklch(0.82 0.08 90)",
  "oklch(0.80 0.09 60)",
];

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
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

function DeleteDialog({
  entry,
  onConfirm,
  onCancel,
  busy,
}: {
  entry: Entry;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-border/60 bg-card/95 p-6 shadow-xl backdrop-blur-md"
      >
        <h3 className="font-display text-xl text-foreground">Delete this entry?</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You are about to permanently delete{" "}
          <span className="font-medium text-foreground">{entry.author_name}</span>'s message. This
          cannot be undone.
        </p>
        <blockquote className="mt-3 rounded-xl border border-border/50 bg-secondary/30 px-4 py-2.5 text-sm italic text-foreground/70 line-clamp-3">
          "{entry.message}"
        </blockquote>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-border/60 bg-card/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2 text-xs uppercase tracking-[0.2em] text-white shadow-sm transition disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, author_name, message, relationship, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setError(error.message);
    } else {
      setEntries((data ?? []) as Entry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from("guestbook_entries")
      .insert({
        author_name: name.trim(),
        message: message.trim(),
        relationship: relationship.trim() || null,
      })
      .select("id, author_name, message, relationship, created_at")
      .maybeSingle();
    setSubmitting(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't post your message. Please try again.");
      return;
    }
    setEntries((prev) => [data as Entry, ...prev]);
    setMessage("");
    setRelationship("");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from("guestbook_entries")
      .delete()
      .eq("id", pendingDelete.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      setPendingDelete(null);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-16">
      <AnimatePresence>
        {pendingDelete && (
          <DeleteDialog
            entry={pendingDelete}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
            busy={deleting}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 h-px w-16 bg-primary/40" />
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Guestbook</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Leave a little love for the little one. Family and friends — your words will be kept here
          always.
        </p>
      </motion.div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-petal)] backdrop-blur-sm sm:p-8"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={60}
            className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Relationship (optional — auntie, friend…)"
            maxLength={40}
            className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A message for baby…"
          required
          rows={3}
          maxLength={600}
          className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {message.length}/600
          </span>
          <motion.button
            type="submit"
            disabled={submitting || !name.trim() || !message.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-[var(--shadow-petal)] transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Sign the book
          </motion.button>
        </div>
      </motion.form>

      {error && (
        <p className="mx-auto mt-4 max-w-xl rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-10 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center"
          >
            <Heart className="mx-auto mb-3 h-6 w-6 text-primary/60" />
            <p className="font-display text-xl italic text-foreground/70">
              The first words are yet to be written.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to leave a note.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {entries.map((e, i) => (
              <motion.article
                key={e.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4) }}
                className="group flex gap-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-petal)] backdrop-blur-sm sm:p-6"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-sm text-white shadow-sm"
                  style={{ backgroundColor: AVATAR_PALETTE[i % AVATAR_PALETTE.length] }}
                  aria-hidden
                >
                  {initials(e.author_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-lg text-foreground">{e.author_name}</span>
                    {e.relationship && (
                      <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {e.relationship}
                      </span>
                    )}
                    <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {timeAgo(e.created_at)}
                    </span>
                    {isAdmin && (
                      <motion.button
                        type="button"
                        onClick={() => setPendingDelete(e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete entry"
                        className="ml-2 rounded-full p-1 text-muted-foreground/40 opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {e.message}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
