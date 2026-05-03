"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { CompletionScreen } from "@/modules/learning/CompletionScreen";
import { DemoLoop } from "@/modules/learning/DemoLoop";
import { ProgressRibbon } from "@/modules/learning/ProgressRibbon";
import { StepView } from "@/modules/learning/StepView";
import {
  ALPHABET_BY_ID,
  ALPHABET_LIST,
  letterToGestureId,
  spellWord,
  type AlphabetEntry,
  type LetterGestureId,
} from "@/modules/mirror/gestures";
import { useStepMachineState } from "@/lib/store";
import type { Routine } from "@/services/api";

type CompletionStats = { attempts: number; avgAccuracy: number };

// per-letter section. shows the letter shape, demo loop, words to practise,
// and reuses StepView to run a synthetic routine when the learner picks a
// word — same camera lifecycle, same coach hint, same skeleton overlay as
// the main /learn flow.
export default function LetterPage({
  params,
}: {
  params: Promise<{ letter: string }>;
}) {
  const { letter } = use(params);
  const id = letterToGestureId(letter);
  if (!id) notFound();

  const entry = ALPHABET_BY_ID[id];
  if (!entry) notFound();

  return <LetterDetail entry={entry} />;
}

function LetterDetail({ entry }: { entry: AlphabetEntry }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("word")?.toLowerCase() ?? "";

  const [activeWord, setActiveWord] = useState<string>(() =>
    entry.words.includes(initialWord) ? initialWord : "",
  );
  const [completion, setCompletion] = useState<CompletionStats | null>(null);

  const stepIndex = useStepMachineState((s) => s.stepIndex);
  const stepCount = useStepMachineState((s) => s.stepCount);

  const routine = useMemo<Routine | null>(() => {
    if (activeWord) return buildWordRoutine(activeWord);
    return buildLetterRoutine(entry);
  }, [activeWord, entry]);

  const letterIndex = ALPHABET_LIST.findIndex((e) => e.id === entry.id);
  const prev = letterIndex > 0 ? ALPHABET_LIST[letterIndex - 1] : null;
  const next = letterIndex < ALPHABET_LIST.length - 1 ? ALPHABET_LIST[letterIndex + 1] : null;

  const handleComplete = useCallback((attempts: number, avgAccuracy: number) => {
    setCompletion({ attempts, avgAccuracy });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCompletion(null);
  }, []);

  const handleExit = useCallback(() => {
    setCompletion(null);
    setActiveWord("");
  }, []);

  const handlePickWord = useCallback(
    (word: string) => {
      setCompletion(null);
      setActiveWord(word);
      // mirror the choice into the url so a refresh keeps the current word.
      const next = new URLSearchParams(searchParams.toString());
      next.set("word", word);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleClearWord = useCallback(() => {
    setCompletion(null);
    setActiveWord("");
    router.replace(`?`, { scroll: false });
  }, [router]);

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <Breadcrumb letter={entry.letter} />
      <Hero entry={entry} />

      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <DemoLoop gestureId={entry.id} title={`letter ${entry.letter}`} cadenceMs={1800} />
        <ShapeCard entry={entry} />
      </div>

      <WordPicker
        entry={entry}
        activeWord={activeWord}
        onPick={handlePickWord}
        onClear={handleClearWord}
      />

      {routine && !completion && (
        <>
          <ProgressRibbon stepIndex={stepIndex} stepCount={stepCount || routine.steps.length} />
          <StepView routine={routine} onComplete={handleComplete} onExit={handleExit} />
        </>
      )}

      {routine && completion && (
        <CompletionScreen
          routine={routine}
          attempts={completion.attempts}
          avgAccuracy={completion.avgAccuracy}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}

      <LetterNav prev={prev} next={next} />
    </div>
  );
}

function Breadcrumb({ letter }: { letter: string }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2 font-mono text-xs text-ink-faint">
      <Link href="/alphabet" className="hover:text-ink">alphabet</Link>
      <span aria-hidden>/</span>
      <span className="text-ink">letter {letter}</span>
    </nav>
  );
}

function Hero({ entry }: { entry: AlphabetEntry }) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-ink/10 bg-gradient-to-br from-brand-100 via-accent-mint/30 to-accent-peach/30 p-8 md:p-12">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent-lilac/40 blur-3xl" />
      <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-accent-mint/40 blur-3xl" />

      <div className="relative flex flex-wrap items-center gap-8">
        <div className="grid h-32 w-32 shrink-0 place-items-center rounded-3xl border border-ink/10 bg-white/70 shadow-soft backdrop-blur-sm md:h-40 md:w-40">
          <span className="font-display text-6xl font-bold leading-none md:text-8xl">
            {entry.letter.toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 max-w-xl flex-1">
          <p className="font-mono text-xs tracking-widest text-ink-faint">letter · asl fingerspelling</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-5xl">
            sign &lsquo;{entry.letter}&rsquo;, then build words from it
          </h1>
          <p className="mt-3 text-ink-soft">{entry.shape}</p>
        </div>
      </div>
    </header>
  );
}

function ShapeCard({ entry }: { entry: AlphabetEntry }) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">how to make it</p>
      <h2 className="mt-2 font-display text-2xl font-semibold">letter {entry.letter}</h2>
      <p className="mt-3 text-ink-soft">{entry.hint}</p>

      <ul className="mt-6 grid gap-2 text-sm text-ink-soft">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <span>watch the demo loop on the left — it pulses between rest and the target shape.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-mint" />
          <span>pick a word below, or just practise the letter on its own.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-peach" />
          <span>your camera tracks 21 hand landmarks; the skeleton turns red where you drift.</span>
        </li>
      </ul>
    </div>
  );
}

function WordPicker({
  entry,
  activeWord,
  onPick,
  onClear,
}: {
  entry: AlphabetEntry;
  activeWord: string;
  onPick: (word: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-faint">make words with &lsquo;{entry.letter}&rsquo;</p>
          <h2 className="mt-1 font-display text-2xl font-bold">spell-along practice</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            pick a word — we&apos;ll walk you through each letter in order. the camera below stays the
            same; only the target letter changes per step.
          </p>
        </div>
        {activeWord && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            practise the letter only
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {entry.words.map((word) => {
          const selected = word === activeWord;
          return (
            <button
              key={word}
              type="button"
              onClick={() => onPick(word)}
              className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-soft transition ${
                selected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink/10 bg-white text-ink hover:-translate-y-0.5 hover:border-ink/40"
              }`}
            >
              <span className={`font-mono text-[10px] uppercase tracking-widest ${selected ? "text-white/70" : "text-ink-faint"}`}>
                spell
              </span>
              <span className="font-display text-base">{word}</span>
              <span className={`pill ${selected ? "bg-white/20 text-white" : "bg-surface-muted text-ink-soft"}`}>
                {word.length} letter{word.length === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LetterNav({ prev, next }: { prev: AlphabetEntry | null; next: AlphabetEntry | null }) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
      {prev ? (
        <Link
          href={`/alphabet/${prev.letter}`}
          className="group inline-flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-soft transition hover:-translate-y-0.5 hover:border-ink/40"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-muted font-display text-lg font-bold">
            {prev.letter.toUpperCase()}
          </span>
          <span className="flex flex-col text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">previous</span>
            <span className="font-display text-sm font-semibold">letter {prev.letter}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/alphabet/${next.letter}`}
          className="group inline-flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-soft transition hover:-translate-y-0.5 hover:border-ink/40"
        >
          <span className="flex flex-col text-right">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">next</span>
            <span className="font-display text-sm font-semibold">letter {next.letter}</span>
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-muted font-display text-lg font-bold">
            {next.letter.toUpperCase()}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

// synthetic routines built client-side from the alphabet metadata. they never
// touch the backend — StepView only needs a Routine shape and posts each
// step's progress through the existing comparator + idempotency path.
function buildLetterRoutine(entry: AlphabetEntry): Routine {
  return {
    id: `alphabet-letter-${entry.letter}`,
    name: `practise the letter ${entry.letter}`,
    description: `hold the '${entry.letter}' shape until the comparator locks in.`,
    scenario_tag: "alphabet",
    steps: [
      {
        gesture_id: entry.id,
        prompt: `sign the letter '${entry.letter}'`,
        hint: entry.hint,
      },
    ],
  };
}

function buildWordRoutine(word: string): Routine | null {
  const ids: LetterGestureId[] = spellWord(word);
  if (ids.length === 0) return null;
  return {
    id: `alphabet-word-${word}`,
    name: `spell '${word}'`,
    description: `fingerspell '${word}', one letter at a time.`,
    scenario_tag: "alphabet",
    steps: ids.map((id, i) => {
      const entry = ALPHABET_BY_ID[id];
      const ordinal = `${i + 1}/${ids.length}`;
      return {
        gesture_id: id,
        prompt: `${ordinal} · sign '${entry.letter}'`,
        hint: entry.hint,
      };
    }),
  };
}
