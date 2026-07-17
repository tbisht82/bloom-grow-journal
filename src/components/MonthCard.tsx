import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MonthEntry } from "@/lib/months";
import { Calendar, Camera, ChevronDown, Heart, Sparkles, Utensils, Video } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function MonthCard({ entry, index }: { entry: MonthEntry; index: number }) {
  const flipped = index % 2 === 1;
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="relative"
    >
      {/* connector dot */}
      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } },
        }}
        className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-[var(--shadow-petal)] md:block"
      >
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-primary/40"
        />
      </motion.div>

      <div
        className={`grid gap-6 md:grid-cols-2 md:gap-16 ${
          flipped ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Left */}
        <motion.div
          variants={fadeUp}
          className={`space-y-4 ${flipped ? "md:text-left" : "md:text-right"}`}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm">
            <span>Month {entry.month}</span>
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span>{entry.weeks}</span>
          </div>
          <motion.h3 variants={fadeUp} className="font-display text-4xl text-foreground sm:text-5xl">
            {entry.title}
          </motion.h3>
          <div className={`flex items-center gap-4 ${flipped ? "md:justify-start" : "md:justify-end"}`}>
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
              aria-hidden
            >
              {entry.sizeEmoji}
            </motion.div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Baby is the size of
              </div>
              <div className="font-display text-2xl text-primary">{entry.size}</div>
            </div>
          </div>
          <motion.p variants={fadeUp} className="text-base leading-relaxed text-foreground/80">
            {entry.notes}
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 pt-2">
            {[Camera, Camera, Video].map((Icon, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, borderColor: "var(--color-primary)" }}
                whileTap={{ scale: 0.97 }}
                className="group flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right */}
        <motion.div variants={fadeUp} className="space-y-4">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-full border border-border/60 bg-card/70 px-5 py-3 text-xs uppercase tracking-[0.25em] text-primary shadow-[var(--shadow-petal)] backdrop-blur-sm transition hover:bg-card md:hidden"
          >
            <span>{open ? "Hide details" : "Show details"}</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {(open || typeof window === "undefined") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 overflow-hidden md:!h-auto md:!opacity-100"
              >
                <Section icon={<Sparkles className="h-4 w-4" />} title="Milestones">
                  <ul className="space-y-1.5">
                    {entry.milestones.map((m, i) => (
                      <motion.li
                        key={m}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-2 text-sm text-foreground/80"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </Section>

                <Section icon={<Calendar className="h-4 w-4" />} title="Appointments">
                  <ul className="space-y-1.5">
                    {entry.appointments.map((a) => (
                      <li
                        key={a.label}
                        className="flex items-baseline justify-between gap-4 text-sm text-foreground/80"
                      >
                        <span>{a.label}</span>
                        <span className="font-display text-primary">{a.date}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Section icon={<Utensils className="h-4 w-4" />} title="Cravings">
                    <ul className="space-y-1 text-sm text-foreground/80">
                      {entry.cravings.map((c) => (
                        <li key={c}>· {c}</li>
                      ))}
                    </ul>
                  </Section>
                  <Section icon={<Heart className="h-4 w-4" />} title="Memory">
                    <p className="text-sm italic leading-relaxed text-foreground/80">
                      {entry.memories}
                    </p>
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.article>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 16px 40px -12px oklch(0.78 0.11 20 / 0.35)" }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-petal)] backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}
