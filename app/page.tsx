import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <HowItWorks />
      <Audience />
      <CallToAction />
    </div>
  );
}

/* ---------- hero --------------------------------------------------------- */

function Hero() {
  return (
    <section className="border-b border-ink/5">
      <div className="container-page py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <p className="font-mono text-sm tracking-wide text-ink-faint">
            real-time computer vision
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            learn sign language with your hands
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            HighFive uses your camera to track 21 hand landmarks in real time.
            Sign a gesture, get instant feedback, build fluency. Built for kids,
            families, and classrooms.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} href="/learn" size="lg">
              start learning
            </Button>
            <Button as={Link} href="/live" variant="ghost" size="lg">
              try live mode
            </Button>
          </div>
          <p className="mt-8 font-mono text-xs text-ink-faint">
            27 gestures · 9 routines · no account needed
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- features ----------------------------------------------------- */

const FEATURES = [
  {
    label: "01",
    title: "mirror mode",
    description:
      "see your hand skeleton tracked in real time. pick any gesture, practise, and get instant accuracy feedback.",
    href: "/mirror",
  },
  {
    label: "02",
    title: "live mode",
    description:
      "sign freely — HighFive matches your gesture against the full library and builds a sentence on the fly.",
    href: "/live",
  },
  {
    label: "03",
    title: "guided routines",
    description:
      "scenario-based lessons walk you through conversations step by step. adaptive hints kick in if you get stuck.",
    href: "/learn",
  },
  {
    label: "04",
    title: "educator dashboard",
    description:
      "see which gestures each learner struggles with, track accuracy over time, and spot finger-level drift.",
    href: "/educator",
  },
] as const;

function Features() {
  return (
    <section className="py-24">
      <div className="container-page">
        <p className="font-mono text-sm tracking-wide text-ink-faint">
          what you can do
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
          four ways to learn and teach
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/5 bg-ink/5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col gap-3 bg-white p-8 transition hover:bg-surface-muted"
            >
              <span className="font-mono text-xs text-ink-faint">
                {f.label}
              </span>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="text-ink-soft leading-relaxed">{f.description}</p>
              <span className="mt-auto text-sm font-medium text-brand-600 transition group-hover:translate-x-0.5">
                explore
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- how it works ------------------------------------------------- */

const STEPS = [
  {
    num: "01",
    title: "see the gesture",
    detail:
      "watch a looping demo of each sign — slow mode and ghost-hand overlays help you lock in the shape.",
  },
  {
    num: "02",
    title: "try it yourself",
    detail:
      "your webcam tracks 21 hand landmarks. HighFive compares them in real time and shows exactly where you drift.",
  },
  {
    num: "03",
    title: "earn and advance",
    detail:
      "streak days, xp, achievements, and level-ups keep you coming back. the adaptive engine gets harder as you improve.",
  },
] as const;

function HowItWorks() {
  return (
    <section className="border-y border-ink/5 bg-surface py-24">
      <div className="container-page">
        <p className="font-mono text-sm tracking-wide text-ink-faint">
          how it works
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
          three steps to fluency
        </h2>
        <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="flex flex-col gap-3">
              <span className="font-mono text-3xl font-semibold text-brand-400/60">
                {s.num}
              </span>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-ink-soft leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- audience split ----------------------------------------------- */

function Audience() {
  return (
    <section className="py-24">
      <div className="container-page grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-ink/5 p-8">
          <p className="font-mono text-xs tracking-wide text-ink-faint">
            for families
          </p>
          <h3 className="font-display text-2xl font-bold">
            learn alongside your child
          </h3>
          <p className="text-ink-soft leading-relaxed">
            set up family profiles, track each learner&apos;s progress
            independently, and practise together. no sign language experience
            required — HighFive guides both of you.
          </p>
          <Button
            as={Link}
            href="/family"
            variant="ghost"
            size="sm"
            className="mt-2 w-fit"
          >
            family dashboard
          </Button>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-ink/5 p-8">
          <p className="font-mono text-xs tracking-wide text-ink-faint">
            for educators
          </p>
          <h3 className="font-display text-2xl font-bold">
            see where every learner drifts
          </h3>
          <p className="text-ink-soft leading-relaxed">
            accuracy trends, weak gestures, and per-finger heatmaps for each
            student. create custom routines tailored to your class and watch them
            practise in real time.
          </p>
          <Button
            as={Link}
            href="/educator"
            variant="ghost"
            size="sm"
            className="mt-2 w-fit"
          >
            educator view
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------------------------------------------------------- */

function CallToAction() {
  return (
    <section className="bg-ink py-24 text-white">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-3xl font-bold md:text-5xl">
          ready to start signing?
        </h2>
        <p className="max-w-md text-lg text-white/50">
          no account, no download. open your camera and go.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            as={Link}
            href="/learn"
            size="lg"
            className="bg-white text-ink shadow-soft hover:bg-white/90"
          >
            start learning
          </Button>
          <Button
            as={Link}
            href="/live"
            size="lg"
            variant="ghost"
            className="border border-white/20 text-white hover:bg-white/10"
          >
            try live mode
          </Button>
        </div>
      </div>
    </section>
  );
}
