import Link from "next/link";
import { Button } from "@/components/Button";
import { GestureDeck } from "@/components/GestureDeck";
import { OnboardingHint } from "@/components/OnboardingHint";
import { SignMarquee } from "@/components/SignMarquee";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SignMarquee />
      <Features />
      <HowItWorks />
      <Audience />
      <CallToAction />
      <OnboardingHint />
    </div>
  );
}

/* ---------- hero --------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      {/* layered background textures — mesh, grid, noise */}
      <div className="absolute inset-0 bg-brand-mesh opacity-80" />
      <div className="absolute inset-0 bg-soft-dots opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="noise-overlay" />

      {/* decorative floating orbs */}
      <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-accent-lilac/40 blur-3xl animate-float" />
      <div className="absolute right-[-8%] top-1/3 h-72 w-72 rounded-full bg-accent-mint/30 blur-3xl animate-floatAlt" />

      <div className="container-page relative py-24 md:py-28 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-mint animate-pulseRing" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-mint" />
              </span>
              real-time computer vision
            </div>

            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem]">
              learn{" "}
              <span className="scribble-underline">sign language</span>
              <br />
              with your{" "}
              <span className="text-rainbow">hands</span>.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
              HighFive uses your camera to track 21 hand landmarks in real time.
              Sign a gesture, get instant feedback, build fluency. Built for
              kids, families, and classrooms.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button as={Link} href="/learn" size="lg">
                start learning
                <Arrow />
              </Button>
              <Button as={Link} href="/live" variant="ghost" size="lg">
                try live mode
              </Button>
            </div>

            {/* stat strip — static but distinctive */}
            <dl className="mt-10 flex flex-wrap gap-6 border-t border-ink/10 pt-6">
              <StatChip label="gestures" value="27" />
              <StatChip label="routines" value="9" />
              <StatChip label="latency" value="<1.5s" />
              <StatChip label="account" value="none" />
            </dl>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <GestureDeck />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        {label}
      </dt>
      <dd className="font-display text-xl font-bold tracking-tight">{value}</dd>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="transition-transform duration-200 group-hover:translate-x-0.5"
      aria-hidden
    >
      <path
        d="M3 8 H13 M9 4 L13 8 L9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    color: "bg-brand-500",
  },
  {
    label: "02",
    title: "live mode",
    description:
      "sign freely — HighFive matches your gesture against the full library and builds a sentence on the fly.",
    href: "/live",
    color: "bg-accent-mint",
  },
  {
    label: "03",
    title: "guided routines",
    description:
      "scenario-based lessons walk you through conversations step by step. adaptive hints kick in if you get stuck.",
    href: "/learn",
    color: "bg-accent-peach",
  },
  {
    label: "04",
    title: "educator dashboard",
    description:
      "see which gestures each learner struggles with, track accuracy over time, and spot finger-level drift.",
    href: "/educator",
    color: "bg-accent-lilac",
  },
] as const;

function Features() {
  return (
    <section className="relative py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm tracking-wide text-ink-faint">
              what you can do
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              four ways to learn and teach
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            every mode runs on the same on-device 21-point hand landmark
            tracker — nothing leaves your browser.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              {/* corner sticker */}
              <span
                className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${f.color} opacity-60 blur-2xl transition duration-500 group-hover:opacity-90`}
              />
              <div className="relative flex items-center justify-between">
                <span className="font-mono text-xs text-ink-faint">
                  {f.label}
                </span>
                <span
                  className={`h-3 w-3 rounded-full ${f.color} ring-4 ring-white`}
                />
              </div>
              <h3 className="relative font-display text-2xl font-semibold">
                {f.title}
              </h3>
              <p className="relative text-ink-soft leading-relaxed">
                {f.description}
              </p>
              <span className="relative mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                explore
                <Arrow />
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
    accent: "bg-accent-peach",
  },
  {
    num: "02",
    title: "try it yourself",
    detail:
      "your webcam tracks 21 hand landmarks. HighFive compares them in real time and shows exactly where you drift.",
    accent: "bg-brand-500",
  },
  {
    num: "03",
    title: "earn and advance",
    detail:
      "streak days, xp, achievements, and level-ups keep you coming back. the adaptive engine gets harder as you improve.",
    accent: "bg-accent-mint",
  },
] as const;

function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-y border-ink/10 bg-surface-muted py-24">
      <div className="absolute inset-0 bg-soft-grid bg-grid-md opacity-40" />
      <div className="container-page relative">
        <p className="font-mono text-sm tracking-wide text-ink-faint">
          how it works
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
          three steps to fluency
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="relative flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white p-7 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${s.accent} font-display text-sm font-bold text-ink`}
                >
                  {s.num}
                </span>
                <div className="h-px flex-1 bg-ink/10" />
                {i < STEPS.length - 1 && (
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
                    <path
                      d="M1 6 H15 M11 2 L15 6 L11 10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-ink-faint"
                    />
                  </svg>
                )}
              </div>
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
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
        <AudienceCard
          eyebrow="for families"
          title="learn alongside your child"
          body="set up family profiles, track each learner's progress independently, and practise together. no sign language experience required — HighFive guides both of you."
          href="/family"
          cta="family dashboard"
          accent="from-accent-mint/40 to-accent-peach/30"
          dot="bg-accent-mint"
        />
        <AudienceCard
          eyebrow="for educators"
          title="see where every learner drifts"
          body="accuracy trends, weak gestures, and per-finger heatmaps for each student. create custom routines tailored to your class and watch them practise in real time."
          href="/educator"
          cta="educator view"
          accent="from-accent-lilac/40 to-brand-100/50"
          dot="bg-accent-lilac"
        />
      </div>
    </section>
  );
}

function AudienceCard({
  eyebrow,
  title,
  body,
  href,
  cta,
  accent,
  dot,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  accent: string;
  dot: string;
}) {
  return (
    <div
      className={`relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-ink/10 bg-gradient-to-br ${accent} p-8`}
    >
      <div className="absolute right-6 top-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        live
      </div>
      <p className="font-mono text-xs tracking-wide text-ink-faint">
        {eyebrow}
      </p>
      <h3 className="font-display text-2xl font-bold md:text-3xl">{title}</h3>
      <p className="text-ink-soft leading-relaxed">{body}</p>
      <Button
        as={Link}
        href={href}
        variant="ghost"
        size="sm"
        className="mt-2 w-fit"
      >
        {cta}
        <Arrow />
      </Button>
    </div>
  );
}

/* ---------- CTA ---------------------------------------------------------- */

function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white">
      <div className="absolute inset-0 bg-brand-mesh opacity-25" />
      <div className="absolute inset-0 bg-soft-grid bg-grid-md opacity-[0.06]" />
      <div className="container-page relative flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
          your camera · your pace · your hands
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">
          ready to start{" "}
          <span className="text-rainbow">signing</span>?
        </h2>
        <p className="max-w-md text-lg text-white/60">
          no account, no download. open your camera and go.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            as={Link}
            href="/learn"
            variant="accent"
            size="lg"
          >
            start learning
            <Arrow />
          </Button>
          <Button
            as={Link}
            href="/live"
            size="lg"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 shadow-none"
          >
            try live mode
          </Button>
        </div>
      </div>
    </section>
  );
}
