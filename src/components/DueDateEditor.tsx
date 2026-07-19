import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDueDate } from "@/lib/useDueDate";
import { Pencil, Sparkles } from "lucide-react";

export function DueDateEditor() {
  const { date, iso, setIso, defaultIso } = useDueDate();
  const [editing, setEditing] = useState(false);
  const [reveal, setReveal] = useState(false);
  const prevIso = useRef(iso);

  useEffect(() => {
    if (prevIso.current !== iso) {
      prevIso.current = iso;
      setReveal(true);
      const t = setTimeout(() => setReveal(false), 1800);
      return () => clearTimeout(t);
    }
  }, [iso]);

  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Reveal burst */}
      <AnimatePresence>
        {reveal && (
          <motion.div
            key="burst"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const dist = 80 + (i % 3) * 30;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: [0, 1, 0],
                    scale: [0.4, 1, 0.6],
                    rotate: (i % 2 ? 1 : -1) * 180,
                  }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: i * 0.02 }}
                  className="absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary via-accent to-secondary"
                />
              );
            })}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4 }}
              className="absolute rounded-full bg-primary/10 p-6"
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col items-center gap-3"
          >
            <input
              type="date"
              value={iso}
              onChange={(e) => setIso(e.target.value)}
              className="rounded-2xl border border-border/70 bg-card/80 px-4 py-2 font-display text-xl text-foreground shadow-[var(--shadow-leaf)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2 text-[11px] uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-primary px-4 py-1.5 text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIso(defaultIso)}
                className="rounded-full border border-border/70 px-4 py-1.5 text-muted-foreground transition hover:text-foreground"
              >
                Reset
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="view"
            type="button"
            onClick={() => setEditing(true)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="group flex flex-col items-center"
          >
            <motion.p
              key={iso}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl italic text-foreground/85 sm:text-3xl"
            >
              {label}
            </motion.p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-70 transition group-hover:opacity-100">
              <Pencil className="h-3 w-3" /> tap to edit · baby may come early
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
