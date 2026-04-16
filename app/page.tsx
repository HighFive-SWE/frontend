import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <div className="container-page flex flex-col gap-16 py-12 md:py-20">
      <Hero />
      <QuickActions />
      <DailyRoutinePreview />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div className="flex flex-col gap-6">
        <span className="pill w-fit">real-time · vision-first</span>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          sign, see, speak —
          <span className="block text-brand-500">together.</span>
        </h1>
        <p className="max-w-xl text-lg text-ink-soft">
          HighFive teaches sign language with live camera feedback, so every gesture gets gentle,
          instant guidance. Built for kids, families, and classrooms.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button as={Link} href="/learn" size="lg">
            start learning
          </Button>
          <Button as={Link} href="/mirror" variant="ghost" size="lg">
            open mirror mode
          </Button>
        </div>
      </div>
      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-md justify-self-center">
      <div className="absolute inset-4 rounded-3xl bg-brand-100 shadow-soft" />
      <div className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white/15 text-5xl">
            ✋
          </div>
          <p className="text-sm uppercase tracking-widest text-white/70">live preview</p>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card
        as={Link}
        href="/learn"
        title="practice a scenario"
        subtitle="stepwise routines with live feedback and adaptive hints."
        accent="mint"
      />
      <Card
        as={Link}
        href="/mirror"
        title="mirror mode"
        subtitle="free-form practice — try any gesture, see the skeleton track."
        accent="lilac"
      />
    </section>
  );
}

function DailyRoutinePreview() {
  const items = [
    { label: "morning · hello", minutes: 2 },
    { label: "family · thank you", minutes: 3 },
    { label: "mealtime · more, please", minutes: 4 },
  ];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">today&apos;s routine</h2>
          <p className="text-ink-soft">three gentle lessons · under ten minutes total.</p>
        </div>
        <Link href="/learn" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          view all →
        </Link>
      </header>
      <ul className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-4 rounded-3xl border border-ink/5 bg-white p-5 shadow-soft"
          >
            <div className="pill w-fit">{item.minutes} min</div>
            <p className="font-display text-lg font-medium">{item.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
