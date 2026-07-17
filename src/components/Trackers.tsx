import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalState } from "@/lib/useLocalState";

type Kick = { at: number };
type MoodLog = { date: string; mood: string; symptoms: string; note: string };
type Weight = { date: string; kg: number };

const MOODS = ["🌷 Radiant", "🌤 Calm", "🌊 Emotional", "😴 Tired", "🤢 Queasy", "🥰 Excited"];

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

function KickCounter() {
  const [kicks, setKicks] = useLocalState<Kick[]>("journal.kicks", []);
  const [session, setSession] = useState<number | null>(null);

  const now = Date.now();
  const inHour = kicks.filter((k) => now - k.at < 3_600_000).length;
  const today = kicks.filter(
    (k) => new Date(k.at).toDateString() === new Date().toDateString()
  ).length;

  const startSession = () => setSession(Date.now());
  const addKick = () => {
    if (session === null) setSession(Date.now());
    setKicks((prev) => [...prev, { at: Date.now() }]);
  };
  const reset = () => {
    setKicks([]);
    setSession(null);
  };

  const sessionMinutes = session ? Math.max(1, Math.round((now - session) / 60000)) : 0;

  return (
    <Card title="Kick Counter" subtitle="Little flutters, counted with love">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-secondary/40 p-4 text-center">
          <div className="font-display text-4xl text-primary">{today}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">today</div>
        </div>
        <div className="rounded-2xl bg-secondary/40 p-4 text-center">
          <div className="font-display text-4xl text-primary">{inHour}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">last hour</div>
        </div>
        <div className="rounded-2xl bg-secondary/40 p-4 text-center">
          <div className="font-display text-4xl text-primary">{sessionMinutes || "—"}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">session min</div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={addKick}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        className="mt-6 w-full rounded-2xl bg-gradient-to-br from-primary to-accent px-6 py-6 font-display text-2xl italic text-primary-foreground shadow-[var(--shadow-petal)]"
      >
        I felt a kick 💗
      </motion.button>

      <div className="mt-4 flex justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <button type="button" onClick={startSession} className="hover:text-foreground">
          Start new session
        </button>
        <button type="button" onClick={reset} className="hover:text-foreground">
          Reset all
        </button>
      </div>
    </Card>
  );
}

function MoodLogger() {
  const [logs, setLogs] = useLocalState<MoodLog[]>("journal.mood", []);
  const [mood, setMood] = useState(MOODS[0]);
  const [symptoms, setSymptoms] = useState("");
  const [note, setNote] = useState("");

  const add = () => {
    if (!mood) return;
    setLogs((prev) => [
      { date: new Date().toISOString().slice(0, 10), mood, symptoms: symptoms.trim(), note: note.trim() },
      ...prev,
    ].slice(0, 30));
    setSymptoms("");
    setNote("");
  };

  return (
    <Card title="Mood & Symptoms" subtitle="A gentle daily check-in">
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              mood === m
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="Symptoms (nausea, back ache, glowing...)"
        className="mt-4 w-full rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A little note for future us…"
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary"
      >
        Save entry
      </button>

      <AnimatePresence>
        {logs.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-2 border-t border-border/50 pt-4"
          >
            {logs.slice(0, 5).map((l, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-secondary/30 px-4 py-2 text-sm"
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{l.date}</span>
                  <span>{l.mood}</span>
                </div>
                {l.symptoms && <div className="text-foreground/80">{l.symptoms}</div>}
                {l.note && <div className="mt-0.5 italic text-foreground/70">“{l.note}”</div>}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Card>
  );
}

function WeightTracker() {
  const [entries, setEntries] = useLocalState<Weight[]>("journal.weight", []);
  const [kg, setKg] = useState("");

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const delta = first && last ? +(last.kg - first.kg).toFixed(1) : 0;

  const add = () => {
    const n = parseFloat(kg);
    if (!Number.isFinite(n) || n <= 0) return;
    const date = new Date().toISOString().slice(0, 10);
    setEntries((prev) => [...prev.filter((e) => e.date !== date), { date, kg: n }]);
    setKg("");
  };

  const min = sorted.length ? Math.min(...sorted.map((e) => e.kg)) - 1 : 0;
  const max = sorted.length ? Math.max(...sorted.map((e) => e.kg)) + 1 : 1;
  const range = Math.max(0.1, max - min);

  return (
    <Card title="Weight Journey" subtitle="Growing, together">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Today (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className="mt-1 w-32 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary"
        >
          Log
        </button>
        {last && (
          <div className="ml-auto text-right text-sm">
            <div className="font-display text-2xl text-primary">
              {delta >= 0 ? "+" : ""}
              {delta} kg
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              since start
            </div>
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="mt-6 h-32 w-full">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
            <polyline
              fill="none"
              stroke="oklch(0.78 0.09 25)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sorted
                .map((e, i) => {
                  const x = (i / (sorted.length - 1)) * 100;
                  const y = 40 - ((e.kg - min) / range) * 40;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {sorted.map((e, i) => {
              const x = (i / (sorted.length - 1)) * 100;
              const y = 40 - ((e.kg - min) / range) * 40;
              return <circle key={i} cx={x} cy={y} r="0.8" fill="oklch(0.7 0.12 25)" />;
            })}
          </svg>
        </div>
      )}
    </Card>
  );
}

export function Trackers() {
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
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Little Trackers</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Tender rhythms to notice each day — kicks, moods, and the gentle change of a growing body.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <KickCounter />
        <WeightTracker />
        <div className="md:col-span-2">
          <MoodLogger />
        </div>
      </div>
    </section>
  );
}
