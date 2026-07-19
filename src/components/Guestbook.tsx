import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Trash2 } from "lucide-react";
import { useLocalState } from "@/lib/useLocalState";

type Entry = {
  id: string;
  name: string;
  message: string;
  createdAt: number;
  hearts: number;
};

export function Guestbook() {
  const [entries, setEntries] = useLocalState<Entry[]>("journal.guestbook", []);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim(),
      createdAt: Date.now(),
      hearts: 0,
    };
    setEntries([entry, ...entries]);
    setName("");
    setMessage("");
  };

  const heart = (id: string) =>
    setEntries(entries.map((e) => (e.id === id ? { ...e, hearts: e.hearts + 1 } : e)));
  const remove = (id: string) => setEntries(entries.filter((e) => e.id !== id));

  return (
    <section id="guestbook" className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
          from our people
        </p>
        <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Guestbook</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          A little corner for family and friends to leave a note, a wish, or a memory for our
          little one to read one day.
        </p>
      </motion.div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mx-auto mt-10 max-w-2xl rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-leaf)] backdrop-blur-sm"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-display text-lg text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A note, wish, or memory for baby…"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            saved on this device
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Send className="h-3.5 w-3.5" /> Sign
          </button>
        </div>
      </motion.form>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {entries.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-sm italic text-muted-foreground"
            >
              be the first to leave a little note ✿
            </motion.p>
          )}
          {entries.map((e, i) => (
            <motion.article
              key={e.id}
              layout
              initial={{ opacity: 0, y: 20, rotate: i % 2 ? 1 : -1 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, rotate: 0 }}
              className="paper-texture group relative rounded-3xl border border-border/60 bg-card/85 p-5 shadow-[var(--shadow-leaf)]"
            >
              <p className="font-display text-lg italic text-foreground/85">
                “{e.message}”
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-base text-primary">— {e.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => heart(e.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/10"
                    aria-label="Send love"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" /> {e.hearts}
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    className="rounded-full border border-transparent p-1.5 text-muted-foreground opacity-0 transition hover:border-border/60 hover:text-destructive group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
