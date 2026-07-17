import { createFileRoute } from "@tanstack/react-router";
import { Countdown } from "@/components/Countdown";
import { MonthCard } from "@/components/MonthCard";
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

function Home() {
  const dueString = DUE_DATE.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative overflow-hidden">
      {/* Decorative florals */}
      <img
        src={floralCorner}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-16 w-64 rotate-[200deg] opacity-70 sm:w-96"
      />
      <img
        src={floralCorner}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-24 top-[40vh] w-56 opacity-60 sm:w-80"
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-28">
        <p className="mb-6 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
          A journal for our little one
        </p>
        <h1 className="font-display text-5xl leading-[1.05] text-foreground sm:text-7xl md:text-8xl">
          {PARENTS.one}
          <span className="mx-3 italic text-primary">&</span>
          {PARENTS.two}
        </h1>
        <div className="mx-auto mt-8 flex max-w-md items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            expecting
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <p className="mt-6 font-display text-2xl italic text-foreground/80 sm:text-3xl">
          {dueString}
        </p>

        <div className="mt-12">
          <Countdown />
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            until we meet you
          </p>
        </div>

        <img
          src={heroFloral}
          alt="Watercolor florals"
          width={1600}
          height={1200}
          className="mx-auto mt-14 w-full max-w-3xl opacity-95 mix-blend-multiply"
        />
      </section>

      {/* Timeline intro */}
      <section className="mx-auto max-w-3xl px-6 py-12 text-center">
        <div className="mx-auto mb-4 h-px w-16 bg-primary/40" />
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">Nine Months</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A slow unfolding — every kick, every craving, every quiet Tuesday morning. This is the
          story of the year we became three.
        </p>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        {/* vertical timeline line */}
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent md:block" />

        <div className="space-y-24 md:space-y-32">
          {months.map((m, i) => (
            <MonthCard key={m.month} entry={m} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="font-display text-2xl italic text-primary">
            with all our love, always.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {PARENTS.one} & {PARENTS.two} · {DUE_DATE.getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
