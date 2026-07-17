import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDueDate } from "@/lib/useDueDate";

export function DueDateEditor() {
  const { date, iso, setIso, defaultIso } = useDueDate();
  const [editing, setEditing] = useState(false);

  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
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
              className="rounded-xl border border-border/70 bg-card/80 px-4 py-2 font-display text-xl text-foreground shadow-[var(--shadow-petal)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2 text-[11px] uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-primary/90 px-4 py-1.5 text-primary-foreground shadow-sm transition hover:bg-primary"
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
            <p className="font-display text-2xl italic text-foreground/80 sm:text-3xl">{label}</p>
            <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-0 transition group-hover:opacity-100">
              tap to edit · baby may come early
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
