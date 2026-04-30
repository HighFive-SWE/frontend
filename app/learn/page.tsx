"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useAppStore, useStepMachineState } from "@/lib/store";
import { CompletionScreen } from "@/modules/learning/CompletionScreen";
import { ProgressRibbon } from "@/modules/learning/ProgressRibbon";
import { RoutinePicker } from "@/modules/learning/RoutinePicker";
import { StepView } from "@/modules/learning/StepView";
import { DailyGoalStrip } from "@/modules/gamification/DailyGoal";
import { fetchRoutines, type Routine } from "@/services/api";

type CompletionStats = { attempts: number; avgAccuracy: number };

export default function LearnPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["routines"],
    queryFn: fetchRoutines,
  });

  const [selected, setSelected] = useState<Routine | null>(null);
  const [completion, setCompletion] = useState<CompletionStats | null>(null);

  const stepIndex = useStepMachineState((s) => s.stepIndex);
  const stepCount = useStepMachineState((s) => s.stepCount);
  const completedRoutineIds = useAppStore((s) => s.completedRoutineIds);
  const completeRoutine = useAppStore((s) => s.completeRoutine);
  const exitRoutine = useAppStore((s) => s.exitRoutine);
  const currentProfileId = useAppStore((s) => s.currentProfileId);

  // phase 10: switching profiles wipes the store's step-machine state, so
  // a half-played routine would otherwise be stranded with stepIndex=0 + a
  // null routineId. drop the local selection so the new learner starts
  // from the picker.
  const initialProfileRef = useRef(currentProfileId);
  useEffect(() => {
    if (initialProfileRef.current === currentProfileId) return;
    initialProfileRef.current = currentProfileId;
    setSelected(null);
    setCompletion(null);
  }, [currentProfileId]);

  const handleSelect = useCallback((routine: Routine) => {
    setSelected(routine);
    setCompletion(null);
  }, []);

  const handleComplete = useCallback(
    (attempts: number, avgAccuracy: number) => {
      if (!selected) return;
      completeRoutine(selected.id);
      setCompletion({ attempts, avgAccuracy });
    },
    [selected, completeRoutine],
  );

  const handlePlayAgain = useCallback(() => {
    setCompletion(null);
    // re-trigger StepView's `useEffect` on routine.id by clearing then re-selecting.
    if (selected) {
      const again = selected;
      setSelected(null);
      requestAnimationFrame(() => setSelected(again));
    }
  }, [selected]);

  const handleExit = useCallback(() => {
    exitRoutine();
    setSelected(null);
    setCompletion(null);
  }, [exitRoutine]);

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <RoutineListSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container-page py-12">
        <div className="rounded-3xl border border-ink/5 bg-white p-8 shadow-soft">
          <p className="text-ink-soft">couldn&apos;t load routines.</p>
          <Button onClick={() => refetch()} className="mt-4">
            try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-ink-faint">scenarios</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {selected ? selected.name : "pick a scenario to practise"}
        </h1>
        <p className="max-w-2xl text-ink-soft">
          {selected
            ? selected.description
            : "each routine is a tiny conversation. sign each step — we'll guide you if you get stuck."}
        </p>
      </header>

      <DailyGoalStrip />

      {!selected && (
        <>
          <div className="flex justify-end">
            <Link href="/create-routine">
              <Button size="sm">+ create routine</Button>
            </Link>
          </div>
          <RoutinePicker
            routines={data}
            completedIds={completedRoutineIds}
            onSelect={handleSelect}
          />
        </>
      )}

      {selected && !completion && (
        <>
          <ProgressRibbon stepIndex={stepIndex} stepCount={stepCount || selected.steps.length} />
          <StepView routine={selected} onComplete={handleComplete} onExit={handleExit} />
        </>
      )}

      {selected && completion && (
        <CompletionScreen
          routine={selected}
          attempts={completion.attempts}
          avgAccuracy={completion.avgAccuracy}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </div>
  );
}

function RoutineListSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-3xl bg-surface-muted" />
      ))}
    </div>
  );
}
