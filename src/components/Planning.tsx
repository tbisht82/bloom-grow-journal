import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalState } from "@/lib/useLocalState";

type Name = { id: string; name: string; meaning: string; votes: number };
type ChecklistItem = { id: string; text: string; done: boolean };
type Appt = { id: string; date: string; label: string };

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: uid(), text: "Choose the crib", done: false },
  { id: uid(), text: "Wash newborn clothes in gentle detergent", done: false },
  { id: uid(), text: "Install the car seat", done: false },
  { id: uid(), text: "Pack the hospital bag", done: false },
  { id: uid(), text: "Stock up on nappies & wipes", done: false },
  { id: uid(), text: "Set up the changing station", done: false },
];

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

function BabyNames() {
  const [names, setNames] = useLocalState<Name[]>("journal.names", []);
  const [n, setN] = useState("");
  const [m, setM] = useState("");

  const add = () => {
    if (!n.trim()) return;
    setNames((prev) => [...prev, { id: uid(), name: n.trim(), meaning: m.trim(), votes: 0 }]);
    setN("");
    setM("");
  };
  const vote = (id: string, d: number) =>
    setNames((prev) => prev.map((x) => (x.id === id ? { ...x, votes: x.votes + d } : x)));
  const remove = (id: string) => setNames((prev) => prev.filter((x) => x.id !== id));

  const sorted = [...names].sort((a, b) => b.votes - a.votes);

  return (
    <Card title="Baby Name Shortlist" subtitle="Whispered possibilities">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={n}
          onChange={(e) => setN(e.target.value)}
          placeholder="Name"
          className="flex-1 rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          value={m}
          onChange={(e) => setM(e.target.value)}
          placeholder="Meaning (optional)"
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

      <ul className="mt-5 space-y-2">
        <AnimatePresence>
          {sorted.map((x) => (
            <motion.li
              key={x.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 rounded-2xl bg-secondary/30 px-4 py-3"
            >
              <div className="flex-1">
                <div className="font-display text-xl text-foreground">{x.name}</div>
                {x.meaning && (
                  <div className="text-xs italic text-muted-foreground">{x.meaning}</div>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <button
                  type="button"
                  onClick={() => vote(x.id, -1)}
                  className="rounded-full px-2 py-1 text-muted-foreground hover:text-foreground"
                  aria-label="downvote"
                >
                  −
                </button>
                <span className="w-6 text-center font-display text-lg text-primary">{x.votes}</span>
                <button
                  type="button"
                  onClick={() => vote(x.id, 1)}
                  className="rounded-full px-2 py-1 text-muted-foreground hover:text-foreground"
                  aria-label="upvote"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => remove(x.id)}
                  className="ml-2 rounded-full px-2 py-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive"
                  aria-label="remove"
                >
                  ×
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <li className="rounded-2xl bg-secondary/20 px-4 py-6 text-center text-sm italic text-muted-foreground">
            No names yet — add the first one above.
          </li>
        )}
      </ul>
    </Card>
  );
}

function NurseryChecklist() {
  const [items, setItems] = useLocalState<ChecklistItem[]>("journal.checklist", DEFAULT_CHECKLIST);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setItems((prev) => [...prev, { id: uid(), text: text.trim(), done: false }]);
    setText("");
  };
  const toggle = (id: string) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const done = items.filter((x) => x.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <Card title="Nursery Checklist" subtitle={`${done} of ${items.length} ready`}>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary/50">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-1.5">
        <AnimatePresence>
          {items.map((x) => (
            <motion.li
              key={x.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary/30"
            >
              <button
                type="button"
                onClick={() => toggle(x.id)}
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                  x.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
                aria-label="toggle"
              >
                {x.done && <span className="text-[10px]">✓</span>}
              </button>
              <span
                className={`flex-1 text-sm ${
                  x.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {x.text}
              </span>
              <button
                type="button"
                onClick={() => remove(x.id)}
                className="text-xs text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                aria-label="remove"
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add something to prepare…"
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
    </Card>
  );
}

function BirthPlan() {
  const [plan, setPlan] = useLocalState<string>(
    "journal.birthPlan",
    "Soft lights, gentle music, our people close by. Skin-to-skin as soon as possible."
  );
  return (
    <Card title="Birth Plan" subtitle="How we'd love this day to feel">
      <textarea
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        rows={6}
        className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 p-4 font-display text-lg italic leading-relaxed text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                <button
                  type="button"
                  onClick={() => remove(x.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
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
                <button
                  type="button"
                  onClick={() => remove(x.id)}
                  className="ml-auto text-xs hover:text-destructive"
                >
                  ×
                </button>
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
          Small preparations, made with care — names to whisper, lists to tick, a plan for the softest welcome.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <BabyNames />
        <NurseryChecklist />
        <Appointments />
        <BirthPlan />
      </div>
    </section>
  );
}
