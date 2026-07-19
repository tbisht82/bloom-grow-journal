import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader as Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useLocalState } from "@/lib/useLocalState";

type Appt = { id: string; date: string; label: string };

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
  const [items, setItems] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const { isAdmin } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, date, label")
      .order("date", { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((data ?? []) as Appt[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!date || !label.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("appointments")
      .insert({ date, label: label.trim() })
      .select("id, date, label")
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't save appointment.");
      return;
    }
    setItems((prev) =>
      [...prev, data as Appt].sort((a, b) => a.date.localeCompare(b.date))
    );
    setDate("");
    setLabel("");
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

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
            disabled={busy || !date || !label.trim()}
            className="rounded-full bg-primary/90 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50"
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
                    disabled={busy}
                    className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
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
                    disabled={busy}
                    className="ml-auto text-xs hover:text-destructive disabled:opacity-50"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {loading && (
        <div className="mt-4 flex justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="mt-5 rounded-2xl bg-secondary/20 px-4 py-6 text-center text-sm italic text-muted-foreground">
          No appointments yet — add the next one above.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
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
