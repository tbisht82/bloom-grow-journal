import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Countdown } from "@/components/Countdown";
import { MonthCard } from "@/components/MonthCard";
import { DueDateEditor } from "@/components/DueDateEditor";
import { Trackers } from "@/components/Trackers";
import { Planning } from "@/components/Planning";
import { DUE_DATE, PARENTS, months } from "@/lib/months";
import heroFloral from "@/assets/hero-floral.jpg";
import floralCorner from "@/assets/floral-corner.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${PARENTS.one} & ${PARENTS.two} — Our Little One's Journal` },
      {
        name: "description",
        content:
          "A soft, tender pregnancy journal — nine months of growing, waiting, and loving. Countdown, milestones, memories.",
      },
      { property: "og:title", content: `${PARENTS.one} & ${PARENTS.two} — Pregnancy Journal` },
      {
        property: "og:description",
        content: "Nine months of milestones, cravings, appointments, and memories.",
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

function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const timelineRef = useRef<HTMLElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  return (
    <main className="relative overflow-hidden">
      {/* Floating decorative florals */}
      <motion.img
        src={floralCorner}
        alt=""
        aria-hidden
        animate={{ y: [0, -14, 0], rotate: [200, 205, 200] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 -top-16 w-64 opacity-70 sm:w-96"
      />
      <motion.img
        src={floralCorner}
        alt=""
        aria-hidden
        animate={{ y: [0, 18, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-[40vh] w-56 opacity-60 sm:w-80"
      />
      <motion.img
        src={floralCorner}
        alt=""
        aria-hidden
        animate={{ y: [0, -20, 0], rotate: [90, 95, 90] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-16 top-[120vh] hidden w-72 opacity-50 md:block"
      />

      {/* Floating petals */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden
          initial={{ y: -20, x: `${(i * 13) % 100}vw`, opacity: 0 }}
          animate={{
            y: ["0vh", "110vh"],
            x: [`${(i * 13) % 100}vw`, `${((i * 13) % 100) + (i % 2 ? 8 : -8)}vw`],
            opacity: [0, 0.6, 0.6, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 18 + (i % 4) * 4,
            repeat: Infinity,
            delay: i * 2.2,
            ease: "linear",
          }}
          className="pointer-events-none absolute top-0 h-3 w-3 rounded-full bg-gradient-to-br from-[oklch(0.9_0.06_25)] to-[oklch(0.85_0.08_20)] shadow-sm"
        />
      ))}

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-28"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-6 text-[11px] uppercase text-muted-foreground"
        >
          A journal for our little one
        </motion.p>

        <AnimatedHeading
          text={`${PARENTS.one} & ${PARENTS.two}`}
          className="font-display text-5xl leading-[1.05] text-foreground sm:text-7xl md:text-8xl"
        />

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
          className="mx-auto mt-8 flex max-w-md items-center gap-4"
        >
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            expecting
          </span>
          <span className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <DueDateEditor />
        </motion.div>

        <div className="mt-12">
          <Countdown />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            until we meet you
          </motion.p>
        </div>

        <motion.img
          src={heroFloral}
          alt="Watercolor florals"
          width={1600}
          height={1200}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.95, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.4, ease: "easeOut" }}
          className="mx-auto mt-14 w-full max-w-3xl mix-blend-multiply"
        />
      </motion.section>

      {/* Timeline intro */}
      <motion.section
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
      <section ref={timelineRef} className="relative mx-auto max-w-6xl px-6 pb-32">
        {/* animated growing line */}
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
