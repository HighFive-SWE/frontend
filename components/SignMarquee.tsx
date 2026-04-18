// scrolling ticker of signs — a visual ambient cue that this is a sign-
// language product even before you scroll. renders two copies of the list
// inline so the marquee can loop seamlessly with a simple 50% translate.

const SIGNS = [
  "hello",
  "thank you",
  "please",
  "water",
  "help",
  "play",
  "more",
  "friend",
  "school",
  "home",
  "sorry",
  "yes",
  "no",
  "food",
  "drink",
  "stop",
  "family",
  "doctor",
];

export function SignMarquee({ className = "" }: { className?: string }) {
  return (
    <div
      className={`group relative overflow-hidden border-y border-ink/10 bg-ink py-5 text-white ${className}`}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />

      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex items-center gap-10 pr-10">
            {SIGNS.map((sign, i) => (
              <li
                key={`${copy}-${sign}`}
                className="flex shrink-0 items-center gap-4 font-display text-2xl font-semibold tracking-tight md:text-3xl"
              >
                <span className={i % 3 === 0 ? "text-accent-mint" : i % 3 === 1 ? "text-accent-peach" : "text-accent-lilac"}>
                  ✦
                </span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
