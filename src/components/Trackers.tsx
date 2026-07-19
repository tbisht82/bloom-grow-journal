import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader as Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type KickSession = {
  id: string;
  kicks: number;
  started_at: string;
  ended_at: string | null;
};

type WeightLog = {
  id: string;
  kind: "mom" | "baby";
  value_kg: number;
  logged_at: string;
};

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

function elapsedMinutes(startedAt: string) {
  return Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
}

function KickCounter() {
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<KickSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("kick_sessions")
      .select("id, kicks, started_at, ended_at")
      .order("started_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    const rows = (data ?? []) as KickSession[];
    setSessions(rows);
    setActive(rows.find((r) => r.ended_at === null) ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [active]);

  const startSession = async () => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("kick_sessions")
      .insert({ kicks: 0 })
      .select("id, kicks, started_at, ended_at")
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't start a session.");
      return;
    }
    setActive(data as KickSession);
    setSessions((prev) => [data as KickSession, ...prev]);
  };

  const addKick = async () => {
    if (!active) {
      startSession();
      return;
    }
    setBusy(true);
    const nextKicks = active.kicks + 1;
    const { error } = await supabase
      .from("kick_sessions")
      .update({ kicks: nextKicks })
      .eq("id", active.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    const updated = { ...active, kicks: nextKicks };
    setActive(updated);
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const endSession = async () => {
    if (!active) return;
    setBusy(true);
    const { error } = await supabase
      .from("kick_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", active.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, ended_at: new Date().toISOString() } : s))
    );
    setActive(null);
  };

  const resetAll = async () => {
    setBusy(true);
    const { error } = await supabase.from("kick_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions([]);
    setActive(null);
  };

  const todayCount = sessions
    .filter((s) => new Date(s.started_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.kicks, 0);
  const lastHourCount = sessions
    .filter((s) => Date.now() - new Date(s.started_at).getTime() < 3_600_000)
    .reduce((sum, s) => sum + s.kicks, 0);
  const sessionMinutes = active ? elapsedMinutes(active.started_at) : 0;

  return (
    <Card title="Kick Counter" subtitle="Little flutters, counted with love">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-secondary/40 p-4 text-center">
          <div className="font-display text-4xl text-primary">{todayCount}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">today</div>
        </div>
        <div className="rounded-2xl bg-secondary/40 p-4 text-center">
          <div className="font-display text-4xl text-primary">{lastHourCount}</div>
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
        disabled={busy}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        className="mt-6 w-full rounded-2xl bg-gradient-to-br from-primary to-accent px-6 py-6 font-display text-2xl italic text-primary-foreground shadow-[var(--shadow-petal)] disabled:opacity-50"
      >
        I felt a kick {active ? `(${active.kicks})` : "💗"}
      </motion.button>

      {active && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Session running · {active.kicks} {active.kicks === 1 ? "kick" : "kicks"} in {sessionMinutes} min
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <button type="button" onClick={startSession} disabled={busy} className="hover:text-foreground disabled:opacity-50">
          {active ? "New session" : "Start session"}
        </button>
        <div className="flex gap-3">
          {active && (
            <button type="button" onClick={endSession} disabled={busy} className="hover:text-foreground disabled:opacity-50">
              End session
            </button>
          )}
          <button type="button" onClick={resetAll} disabled={busy} className="hover:text-destructive disabled:opacity-50">
            Reset all
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <AnimatePresence>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-2 border-t border-border/50 pt-4"
          >
            {sessions.slice(0, 6).map((s) => (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" · "}
                  {new Date(s.started_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="font-display text-primary">
                  {s.kicks} {s.kicks === 1 ? "kick" : "kicks"}
                  {s.ended_at === null && <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">live</span>}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      )}
    </Card>
  );
}

function WeightHistory({ entries }: { entries: WeightLog[] }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.logged_at.localeCompare(a.logged_at)),
    [entries]
  );

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-border/40 bg-card/40 px-3 py-4 text-center text-xs italic text-muted-foreground">
        No entries yet — log your first weight to begin.
      </p>
    );
  }

  return (
    <div className="max-h-44 overflow-y-auto rounded-xl border border-border/40 bg-card/40 p-2">
      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {sorted.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition hover:bg-secondary/40"
            >
              <span className="text-muted-foreground">
                {new Date(e.logged_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-display text-primary">{e.value_kg} kg</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function WeightTracker() {
  const [momEntries, setMomEntries] = useState<WeightLog[]>([]);
  const [babyEntries, setBabyEntries] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [momKg, setMomKg] = useState("");
  const [babyKg, setBabyKg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("weight_logs")
      .select("id, kind, value_kg, logged_at")
      .order("logged_at", { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    const rows = (data ?? []) as WeightLog[];
    setMomEntries(rows.filter((r) => r.kind === "mom"));
    setBabyEntries(rows.filter((r) => r.kind === "baby"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logWeight = async (kind: "mom" | "baby", value: string) => {
    const n = parseFloat(value);
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    setError(null);
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("weight_logs")
      .insert({ kind, value_kg: n, logged_at: today })
      .select("id, kind, value_kg, logged_at")
      .maybeSingle();

    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't save weight.");
      return;
    }
    const result = data as WeightLog;
    if (kind === "mom") {
      setMomEntries((prev) =>
        [...prev, result].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
      );
      setMomKg("");
    } else {
      setBabyEntries((prev) =>
        [...prev, result].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
      );
      setBabyKg("");
    }
  };

  const momSorted = useMemo(() => [...momEntries].sort((a, b) => a.logged_at.localeCompare(b.logged_at)), [momEntries]);
  const babySorted = useMemo(() => [...babyEntries].sort((a, b) => a.logged_at.localeCompare(b.logged_at)), [babyEntries]);

  const momDelta = momSorted.length >= 2 ? +(momSorted[momSorted.length - 1].value_kg - momSorted[0].value_kg).toFixed(1) : 0;
  const babyLatest = babySorted.length ? babySorted[babySorted.length - 1].value_kg : null;

  const renderSparkline = (entries: WeightLog[], color: string) => {
    if (entries.length < 2) return null;
    const min = Math.min(...entries.map((e) => e.value_kg)) - 1;
    const max = Math.max(...entries.map((e) => e.value_kg)) + 1;
    const range = Math.max(0.1, max - min);
    return (
      <div className="mt-3 h-20 w-full">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={entries
              .map((e, i) => {
                const x = (i / (entries.length - 1)) * 100;
                const y = 30 - ((e.value_kg - min) / range) * 30;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {entries.map((e, i) => {
            const x = (i / (entries.length - 1)) * 100;
            const y = 30 - ((e.value_kg - min) / range) * 30;
            return <circle key={e.id} cx={x} cy={y} r="0.8" fill={color} />;
          })}
        </svg>
      </div>
    );
  };

  return (
    <Card title="Weight Journey" subtitle="Growing, together">
      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-6">
        {/* Mom */}
        <div className="rounded-2xl bg-secondary/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-xl text-foreground">Mom</h4>
            {momSorted.length >= 2 && (
              <div className="text-right text-sm">
                <span className="font-display text-2xl text-primary">
                  {momDelta >= 0 ? "+" : ""}
                  {momDelta} kg
                </span>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">since start</div>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Today (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={momKg}
                    onChange={(e) => setMomKg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && logWeight("mom", momKg)}
                    placeholder={momSorted.length ? String(momSorted[momSorted.length - 1].value_kg) : "0.0"}
                    className="mt-1 w-28 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => logWeight("mom", momKg)}
                  disabled={busy || !momKg}
                  className="rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50"
                >
                  Log mom
                </button>
              </div>
              {renderSparkline(momSorted, "oklch(0.78 0.09 25)")}
            </div>
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">History</div>
              <WeightHistory entries={momSorted} />
            </div>
          </div>
        </div>

        {/* Baby */}
        <div className="rounded-2xl bg-secondary/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-xl text-foreground">Baby</h4>
            {babyLatest !== null && (
              <div className="text-right text-sm">
                <span className="font-display text-2xl text-primary">{babyLatest} kg</span>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">latest</div>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Today (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={babyKg}
                    onChange={(e) => setBabyKg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && logWeight("baby", babyKg)}
                    placeholder={babySorted.length ? String(babySorted[babySorted.length - 1].value_kg) : "0.00"}
                    className="mt-1 w-28 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => logWeight("baby", babyKg)}
                  disabled={busy || !babyKg}
                  className="rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50"
                >
                  Log baby
                </button>
              </div>
              {renderSparkline(babySorted, "oklch(0.78 0.06 200)")}
            </div>
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">History</div>
              <WeightHistory entries={babySorted} />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </Card>
  );
}

function MoodLogger() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
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
                {l.note && <div className="mt-0.5 italic text-foreground/70">"{l.note}"</div>}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Card>
  );
}

type MoodLog = { date: string; mood: string; symptoms: string; note: string };
const MOODS = ["🌷 Radiant", "🌤 Calm", "🌊 Emotional", "😴 Tired", "🤢 Queasy", "🥰 Excited"];

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
