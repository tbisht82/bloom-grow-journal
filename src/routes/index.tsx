import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Countdown } from "@/components/Countdown";
import { MonthCard } from "@/components/MonthCard";
import { DueDateEditor } from "@/components/DueDateEditor";
import { Trackers } from "@/components/Trackers";
import { Planning } from "@/components/Planning";
import { Guestbook } from "@/components/Guestbook";
import { MemoryWall } from "@/components/MemoryWall";
import { DUE_DATE, PARENTS, months } from "@/lib/months";
import sketchCorner from "@/assets/sketch-corner.png";
import sketchBranch from "@/assets/sketch-branch.png";
import sketchMark from "@/assets/sketch-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${PARENTS.one} & ${PARENTS.two} — Our Little One's Journal` },
      {
        name: "description",
        content:
          "A soft, sage-toned pregnancy journal — nine months of growing, waiting, and loving. Countdown, memories, and messages from the people we love.",
      },
      { property: "og:title", content: `${PARENTS.one} & ${PARENTS.two} — Pregnancy Journal` },
      {
        property: "og:description",
        content: "Nine months of milestones, cravings, appointments, memories, and love notes.",
      },
    ],
  }),
  component: Home,
});

const words = (t: string) => t.split(" ");

function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  return (
    <h1 className={className}>
      {words(text).map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {w === "&" ? <span className="mx-3 italic text-primary">{w}</span> : w}
          {i < words(text).length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </h1>
  );
}

// Falling leaf/petal shape as SVG (sage green)
function LeafPetal({ i }: { i: number }) {
  const startX = (i * 17) % 100;
  const drift = i % 2 ? 10 : -10;
  const duration = 22 + (i % 5) * 4;
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 20 30"
      initial={{ y: "-10vh", x: `${startX}vw`, opacity: 0, rotate: 0 }}
      animate={{
        y: ["-10vh", "110vh"],
        x: [`${startX}vw`, `${startX + drift}vw`, `${startX - drift / 2}vw`, `${startX + drift}vw`],
        opacity: [0, 0.55, 0.55, 0],
        rotate: [0, 220, 360],
      }}
      transition={{ duration, repeat: Infinity, delay: i * 2.4, ease: "linear" }}
      className="pointer-events-none absolute top-0 h-4 w-3 text-primary/60"
    >
      <path
        d="M10 1 C 3 8, 3 22, 10 29 C 17 22, 17 8, 10 1 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path d="M10 3 L10 27" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
    </motion.svg>
  );
}

function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const timelineRef = useRef<HTMLElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  return (
    <main className="relative overflow-hidden">
      {/* Corner sketches */}
      <motion.img
        src={sketchCorner}
        alt=""
        aria-hidden
        loading="eager"
        animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-16 -top-10 w-56 opacity-70 sm:w-80"
      />
      <motion.img
        src={sketchCorner}
        alt=""
        aria-hidden
        animate={{ y: [0, 12, 0], rotate: [180, 178, 180] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-[60vh] w-56 opacity-60 sm:w-72"
      />

      {/* Floating leaves */}
      {Array.from({ length: 10 }).map((_, i) => (
        <LeafPetal key={i} i={i} />
      ))}

      {/* HERO — bento grid */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-24"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-6 text-center text-[11px] uppercase text-muted-foreground"
        >
          A journal for our little one
        </motion.p>

        <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-6 gap-3 sm:gap-4">
          {/* Names card — spans wide */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative col-span-6 flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 p-8 shadow-[var(--shadow-leaf)] backdrop-blur-sm sm:p-12 md:col-span-4 md:row-span-2"
          >
            <img
              src={sketchBranch}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-4 w-56 opacity-60"
            />
            <AnimatedHeading
              text={`${PARENTS.one} & ${PARENTS.two}`}
              className="text-center font-display text-4xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl"
            />
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
              className="mx-auto mt-6 flex w-full max-w-sm items-center gap-3"
            >
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                expecting
              </span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
              className="mt-6"
            >
              <DueDateEditor />
            </motion.div>
          </motion.div>

          {/* Little mark card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="col-span-3 flex flex-col items-center justify-center rounded-[2rem] border border-border/60 bg-gradient-to-br from-secondary/60 to-accent/40 p-5 text-center shadow-[var(--shadow-leaf)] md:col-span-2"
          >
            <motion.img
              src={sketchMark}
              alt=""
              aria-hidden
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-20 w-20 object-contain"
            />
            <p className="mt-2 font-display text-lg italic text-foreground/80">
              a tiny heartbeat
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              growing every day
            </p>
          </motion.div>

          {/* Season / quote card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="col-span-3 flex flex-col justify-between rounded-[2rem] border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-leaf)] backdrop-blur-sm md:col-span-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              this season
            </span>
            <p className="font-display text-xl italic leading-snug text-foreground/85">
              “Everything we love, we're growing quietly, one day at a time.”
            </p>
          </motion.div>

          {/* Countdown — wide bottom card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="col-span-6 flex flex-col items-center justify-center rounded-[2rem] border border-border/60 bg-gradient-to-br from-card/90 to-secondary/40 p-6 shadow-[var(--shadow-leaf)] backdrop-blur-sm sm:p-8"
          >
            <span className="mb-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              until we meet you
            </span>
            <Countdown />
          </motion.div>

          {/* Quick nav cards */}
          {[
            { href: "#timeline", label: "Nine Months", hint: "the timeline" },
            { href: "#memories", label: "Memory Wall", hint: "photos & scans" },
            { href: "#guestbook", label: "Guestbook", hint: "notes from our people" },
          ].map((c, i) => (
            <motion.a
              key={c.href}
              href={c.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="col-span-2 flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-4 shadow-[var(--shadow-leaf)] backdrop-blur-sm transition hover:border-primary/60"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {c.hint}
              </span>
              <span className="mt-2 font-display text-xl text-foreground">{c.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Timeline intro */}
      <motion.section
        id="timeline"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9 }}
        className="mx-auto max-w-3xl px-6 py-12 text-center"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-4 h-px w-16 origin-left bg-primary/40"
        />
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Nine Months</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A slow unfolding — every kick, every craving, every quiet Tuesday morning. This is the
          story of the year we became three.
        </p>
      </motion.section>

      {/* Timeline */}
      <section ref={timelineRef} className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border/40 md:block" />
        <motion.div
          style={{ scaleY: lineProgress }}
          className="absolute left-1/2 top-0 hidden h-full w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-primary via-primary/70 to-transparent md:block"
        />

        <div className="space-y-24 md:space-y-32">
          {months.map((m, i) => (
            <MonthCard key={m.month} entry={m} index={i} />
          ))}
        </div>
      </section>

      <MemoryWall />
      <Guestbook />
      <Trackers />
      <Planning />

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl px-6 py-12 text-center"
        >
          <motion.p
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-2xl italic text-primary"
          >
            with all our love, always.
          </motion.p>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {PARENTS.one} & {PARENTS.two} · {DUE_DATE.getFullYear()}
          </p>
        </motion.div>
      </footer>
    </main>
  );
}
