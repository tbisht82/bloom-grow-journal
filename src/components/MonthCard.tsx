import type { MonthEntry } from "@/lib/months";
import { Calendar, Camera, Heart, Sparkles, Utensils, Video } from "lucide-react";

export function MonthCard({ entry, index }: { entry: MonthEntry; index: number }) {
  const flipped = index % 2 === 1;
  return (
    <article className="relative">
      {/* connector dot on timeline */}
      <div className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-[var(--shadow-petal)] md:block" />

      <div
        className={`grid gap-6 md:grid-cols-2 md:gap-16 ${
          flipped ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Left: hero + meta */}
        <div className={`space-y-4 ${flipped ? "md:text-left" : "md:text-right"}`}>
          <div
            className={`inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm`}
          >
            <span>Month {entry.month}</span>
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span>{entry.weeks}</span>
          </div>
          <h3 className="font-display text-4xl text-foreground sm:text-5xl">{entry.title}</h3>
          <div
            className={`flex items-center gap-4 ${flipped ? "md:justify-start" : "md:justify-end"}`}
          >
            <div className="text-4xl" aria-hidden>
              {entry.sizeEmoji}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Baby is the size of
              </div>
              <div className="font-display text-2xl text-primary">{entry.size}</div>
            </div>
          </div>
          <p className="text-base leading-relaxed text-foreground/80">{entry.notes}</p>

          {/* Media placeholders */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="group flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition hover:border-primary hover:text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="group flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition hover:border-primary hover:text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="group flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition hover:border-primary hover:text-primary">
              <Video className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Right: cards */}
        <div className="space-y-4">
          <Section icon={<Sparkles className="h-4 w-4" />} title="Milestones">
            <ul className="space-y-1.5">
              {entry.milestones.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {m}
                </li>
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
              <p className="text-sm italic leading-relaxed text-foreground/80">{entry.memories}</p>
            </Section>
          </div>
        </div>
      </div>
    </article>
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
    <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[var(--shadow-petal)] backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
