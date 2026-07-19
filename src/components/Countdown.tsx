import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDueDate } from "@/lib/useDueDate";

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

function Tile({ value, label, delay }: { value: number; label: string; delay: number }) {
  const display = String(value).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-border/60 bg-card/70 px-2 py-4 text-center shadow-[var(--shadow-petal)] backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div className="relative h-10 overflow-hidden sm:h-14">
        <motion.div
          key={display}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl leading-none text-primary sm:text-5xl"
        >
          {display}
        </motion.div>
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
        {label}
      </div>
    </motion.div>
  );
}

export function Countdown() {
  const { iso } = useDueDate();
  const [t, setT] = useState(() => diff(new Date(`${iso}T00:00:00`)));
  useEffect(() => {
    const date = new Date(`${iso}T00:00:00`);
    setT(diff(date));
    const i = setInterval(() => setT(diff(date)), 1000);
    return () => clearInterval(i);
  }, [iso]);

  const items = [
    { label: "days", value: t.days },
    { label: "hours", value: t.hours },
    { label: "mins", value: t.minutes },
    { label: "seconds", value: t.seconds },
  ];

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 sm:gap-6">
      {items.map((it, i) => (
        <Tile key={it.label} value={it.value} label={it.label} delay={i * 0.1} />
      ))}
    </div>
  );
}
