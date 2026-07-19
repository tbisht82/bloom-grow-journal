import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalState } from "@/lib/useLocalState";
import { useAuth } from "@/lib/auth";

type Appt = { id: string; date: string; label: string };

const uid = () => Math.random().toString(36).slice(2, 9);
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-petal)] backdrop-blur-sm sm:p-8"
    >
      <div className="mb-5">
        <h3 className="font-display text-2xl text-foreground sm:text-3xl">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function BirthPlan() {
  const [plan, setPlan] = useLocalState<string>(
    "journal.birthPlan",
    "Soft lights, gentle music, our people close by. Skin-to-skin as soon as possible."
  );
  const { isAdmin } = useAuth();
  return (
    <Card title="Birth Plan" subtitle="How we'd love this day to feel">
      <textarea
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        rows={6}
        disabled={!isAdmin}
        className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 p-4 font-display text-lg italic leading-relaxed text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-default disabled:opacity-90"
      />
      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Autosaved to this device
      </p>
    </Card>
  );
}

function Appointments() {
  const [items, setItems] = useLocalState<Appt[]>("journal.appts", []);
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const { isAdmin } = useAuth();

  const add = () => {
    if (!date || !label.trim()) return;
    setItems((prev) => [...prev, { id: uid(), date, label: label.trim() }]);
    setDate("");
    setLabel("");
  };
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...items].filter((x) => x.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = [...items].filter((x) => x.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <Card title="Doctor Appointments" subtitle="Little dates on the calendar">
      {isAdmin && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Anomaly scan, glucose test…"
            className="flex-1 rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={add}
            className="rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary"
          >
            Add
          </button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Upcoming
          </div>
          <ul className="mt-2 space-y-2">
            {upcoming.map((x) => (
              <motion.li
                key={x.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <div className="text-center">
                  <div className="font-display text-lg text-primary">{fmt(x.date)}</div>
                </div>
                <div className="flex-1 text-sm text-foreground">{x.label}</div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => remove(x.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        </>
      )}
      {past.length > 0 && (
        <>
          <div className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Past
          </div>
          <ul className="mt-2 space-y-1.5">
            {past.slice(0, 4).map((x) => (
              <li
                key={x.id}
                className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm text-muted-foreground"
              >
                <span className="font-display">{fmt(x.date)}</span>
                <span>· {x.label}</span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => remove(x.id)}
                    className="ml-auto text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {items.length === 0 && (
        <p className="mt-5 rounded-2xl bg-secondary/20 px-4 py-6 text-center text-sm italic text-muted-foreground">
          No appointments yet — add the next one above.
        </p>
      )}
    </Card>
  );
}

export function Planning() {
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
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Getting Ready</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Small preparations, made with care — appointments to keep and a plan for the softest welcome.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Appointments />
        <BirthPlan />
      </div>
    </section>
  );
}
