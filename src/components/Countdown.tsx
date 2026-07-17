import { useEffect, useState } from "react";
import { DUE_DATE } from "@/lib/months";

function diff(target: Date) {
  const now = new Date();
  const ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms / 3600000) % 24);
  const minutes = Math.floor((ms / 60000) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  const weeks = Math.floor(days / 7);
  return { days, hours, minutes, seconds, weeks };
}

export function Countdown() {
  const [t, setT] = useState(() => diff(DUE_DATE));
  useEffect(() => {
    const i = setInterval(() => setT(diff(DUE_DATE)), 1000);
    return () => clearInterval(i);
  }, []);

  const items = [
    { label: "weeks", value: t.weeks },
    { label: "days", value: t.days % 7 },
    { label: "hours", value: t.hours },
    { label: "minutes", value: t.minutes },
  ];

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 sm:gap-6">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border/60 bg-card/70 px-2 py-4 text-center shadow-[var(--shadow-petal)] backdrop-blur-sm sm:px-4 sm:py-6"
        >
          <div className="font-display text-3xl leading-none text-primary sm:text-5xl">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
