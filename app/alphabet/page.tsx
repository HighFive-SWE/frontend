import Link from "next/link";
import { Button } from "@/components/Button";
import { ALPHABET_LIST } from "@/modules/mirror/gestures";

// the alphabet hub. one card per letter, plus a strip of "spell this word"
// shortcuts that deep-link into the letter detail page in word-builder mode.
export default function AlphabetPage() {
  return (
    <div className="container-page flex flex-col gap-12 py-12">
      <Hero />
      <LetterGrid />
      <WordSpotlight />
      <FingerspellPrimer />
    </div>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-ink/10 bg-gradient-to-br from-brand-100 via-accent-mint/30 to-accent-peach/30 p-8 md:p-12">
      <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-accent-lilac/40 blur-3xl" />
      <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-accent-mint/40 blur-3xl" />

      <div className="relative flex flex-col gap-4">
        <p className="font-mono text-xs tracking-widest text-ink-faint">alphabet · asl fingerspelling</p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">
          26 letters. infinite words.
        </h1>
        <p className="max-w-2xl text-ink-soft">
          fingerspelling unlocks any noun the gesture library doesn&apos;t cover yet — names,
          places, favourite snacks. each letter has its own page with a demo loop, a coach
          hint, and a list of words to practise spelling.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button as={Link} href="/alphabet/a" size="lg">
            start with &lsquo;a&rsquo;
          </Button>
          <Button as={Link} href="/learn" variant="ghost" size="lg">
            back to scenarios
          </Button>
        </div>

        <dl className="mt-6 flex flex-wrap gap-6 border-t border-ink/10 pt-6">
          <Stat label="letters" value="26" />
          <Stat label="practice words" value={String(ALPHABET_LIST.reduce((n, e) => n + e.words.length, 0))} />
          <Stat label="latency" value="<1.5s" />
          <Stat label="account" value="none" />
        </dl>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className="font-display text-xl font-bold tracking-tight">{value}</dd>
    </div>
  );
}

function LetterGrid() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-faint">pick a letter</p>
          <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">every letter, its own section</h2>
        </div>
        <p className="max-w-sm text-sm text-ink-soft">
          tap any tile to see the shape, watch the demo loop, and practise on camera.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ALPHABET_LIST.map((entry, i) => (
          <li key={entry.id}>
            <Link
              href={`/alphabet/${entry.letter}`}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-3xl border border-ink/10 bg-white p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <span
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${tileAccent(i)} opacity-30 blur-2xl transition duration-500 group-hover:opacity-60`}
              />
              <span className="relative font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                letter {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative font-display text-5xl font-bold leading-none md:text-6xl">
                {entry.letter.toUpperCase()}
              </span>
              <span className="relative truncate text-xs text-ink-soft">
                {entry.words[0]} · {entry.words[1]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TILE_ACCENTS = [
  "bg-accent-mint",
  "bg-accent-peach",
  "bg-accent-lilac",
  "bg-brand-400",
  "bg-accent-sun",
] as const;

function tileAccent(i: number) {
  return TILE_ACCENTS[i % TILE_ACCENTS.length];
}

// small curated set of "first words" that read as natural fingerspelling
// targets for very early learners. clicking any of them deep-links to the
// first letter's detail page with the word pre-selected as the practice
// target — the routine builder there handles the rest.
const SPOTLIGHT_WORDS = [
  "mom", "dad", "yes", "no",
  "cat", "dog", "fox", "bee",
  "ice", "egg", "hug", "joy",
  "key", "log", "owl", "pig",
  "run", "sun", "tea", "up",
  "us", "van", "win", "yak", "zoo",
];

function WordSpotlight() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-faint">word spotlight</p>
          <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">spell a word, end to end</h2>
        </div>
        <p className="max-w-sm text-sm text-ink-soft">
          tap a word — we&apos;ll open the right letter and queue every step in order.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SPOTLIGHT_WORDS.map((word) => (
          <Link
            key={word}
            href={`/alphabet/${word[0]}?word=${encodeURIComponent(word)}`}
            className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:-translate-y-0.5 hover:border-ink/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">spell</span>
            <span className="font-display text-base">{word}</span>
            <span className="text-brand-600 transition group-hover:translate-x-0.5">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FingerspellPrimer() {
  const tips = [
    {
      label: "01",
      title: "anchor your wrist",
      detail:
        "keep the signing hand still — only the fingers move. a wandering wrist confuses the comparator and burns the streak.",
      accent: "bg-accent-peach",
    },
    {
      label: "02",
      title: "pause between letters",
      detail:
        "a tiny half-beat between letters reads as separation. fluent spellers don't sprint; they meter the rhythm.",
      accent: "bg-brand-500",
    },
    {
      label: "03",
      title: "watch your palm",
      detail:
        "most letters face the camera. a few (g, h, p, q) tilt down or sideways — the per-letter page calls those out.",
      accent: "bg-accent-mint",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-ink/10 bg-surface-muted p-8 md:p-12">
      <div className="absolute inset-0 bg-soft-grid bg-grid-md opacity-30" />
      <div className="relative">
        <p className="font-mono text-xs tracking-wide text-ink-faint">fingerspelling primer</p>
        <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">three habits that make any letter readable</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tips.map((t) => (
            <div key={t.label} className="relative flex flex-col gap-2 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.accent} font-display text-sm font-bold text-ink`}>
                  {t.label}
                </span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{t.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
