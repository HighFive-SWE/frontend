"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { GESTURE_LIST, type GestureId } from "@/modules/mirror/gestures";
import { GestureSelector } from "@/modules/routine-builder/GestureSelector";
import { RoutinePreview } from "@/modules/routine-builder/RoutinePreview";
import { StepBuilder } from "@/modules/routine-builder/StepBuilder";
import { useAppStore } from "@/lib/store";
import {
  createRoutine,
  fetchRoutine,
  updateRoutine,
  type RoutineStep,
} from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const MAX_STEPS = 6;

// authoritative source of valid gesture ids in the comparator. used to refuse
// saving a routine that references an id the comparator can no longer match —
// previously a routine with a stale gesture would silently break the learn
// page (no demo loop, no scoring, no error).
const VALID_GESTURE_IDS: ReadonlySet<string> = new Set(GESTURE_LIST.map((g) => g.id));

function partitionSteps(steps: RoutineStep[]): {
  valid: RoutineStep[];
  dropped: string[];
} {
  const valid: RoutineStep[] = [];
  const dropped: string[] = [];
  for (const step of steps) {
    if (VALID_GESTURE_IDS.has(step.gesture_id)) valid.push(step);
    else dropped.push(step.gesture_id);
  }
  return { valid, dropped };
}

export default function CreateRoutinePage() {
  return (
    <Suspense>
      <CreateRoutineInner />
    </Suspense>
  );
}

function CreateRoutineInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const profileId = useAppStore((s) => s.currentProfileId);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [staleSeeded, setStaleSeeded] = useState<string[]>([]);

  // if editing, load existing routine and seed the form once. silently drop
  // any steps whose gesture_id is no longer in the comparator's library and
  // surface the dropped ids inline so the author knows what was lost.
  useQuery({
    queryKey: ["routine", editId],
    queryFn: () => fetchRoutine(editId!),
    enabled: Boolean(editId) && !seeded,
    gcTime: 0,
    meta: {},
    select: (routine) => {
      if (!seeded) {
        const { valid, dropped } = partitionSteps(routine.steps);
        setName(routine.name);
        setDescription(routine.description);
        setSteps(valid);
        setStaleSeeded(dropped);
        setSeeded(true);
      }
      return routine;
    },
  });

  const invalidStepIds = useMemo(
    () => steps.map((s) => s.gesture_id).filter((id) => !VALID_GESTURE_IDS.has(id)),
    [steps],
  );

  const handleAdd = useCallback(
    (gestureId: GestureId) => {
      if (steps.length >= MAX_STEPS) return;
      const meta = GESTURE_LIST.find((g) => g.id === gestureId);
      // refuse to add a gesture that isn't in the comparator's library —
      // GestureSelector only surfaces valid ids today, but defending here means
      // a future programmatic caller can't slip a dead id past the form.
      if (!meta) return;
      setSteps((prev) => [
        ...prev,
        {
          gesture_id: gestureId,
          prompt: `sign '${meta.title}'`,
          hint: meta.hint,
        },
      ]);
    },
    [steps.length],
  );

  const handleRemove = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    setSteps((prev) => {
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setSteps((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // final guard: never POST a routine that references a gesture the
      // comparator can't match. shouldn't be reachable through the ui
      // (handleAdd validates, canSave blocks) — this catches a future
      // programmatic edit path or a bad cache rehydration.
      if (invalidStepIds.length > 0) return null;
      if (editId) {
        return updateRoutine(editId, { name, description, steps });
      }
      if (!profileId) return null;
      return createRoutine({
        name,
        description,
        steps,
        created_by: profileId,
      });
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ["routines"] });
        router.push("/learn");
      }
    },
  });

  const canSave =
    name.trim().length > 0 &&
    steps.length >= 2 &&
    steps.length <= MAX_STEPS &&
    invalidStepIds.length === 0 &&
    !saveMutation.isPending;

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-ink-faint">{editId ? "edit routine" : "new routine"}</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {editId ? "edit your routine" : "build a routine"}
        </h1>
        <p className="max-w-2xl text-ink-soft">
          pick 2–6 gestures, name it, and save. your custom routine shows up alongside the defaults
          on the learn page.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-ink-faint">name</span>
              <input
                type="text"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. morning greetings"
                className="rounded-xl border border-ink/10 bg-surface-muted px-4 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
            </label>
            <label className="mt-4 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-ink-faint">description</span>
              <input
                type="text"
                maxLength={400}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="a short note about what this routine covers"
                className="rounded-xl border border-ink/10 bg-surface-muted px-4 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
            </label>
          </div>

          <GestureSelector onAdd={handleAdd} disabled={steps.length >= MAX_STEPS} />
        </div>

        <div className="flex flex-col gap-6">
          <StepBuilder
            steps={steps}
            maxSteps={MAX_STEPS}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
          {staleSeeded.length > 0 && (
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              dropped {staleSeeded.length === 1 ? "1 step" : `${staleSeeded.length} steps`} that referenced{" "}
              {staleSeeded.length === 1 ? "a gesture" : "gestures"} no longer in the
              library:{" "}
              <span className="font-mono">
                {staleSeeded.map((id) => id.replace(/_/g, " ")).join(", ")}
              </span>
              . re-add a replacement before saving.
            </div>
          )}
          <RoutinePreview name={name} description={description} steps={steps} />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              disabled={!canSave}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending
                ? "saving…"
                : editId
                  ? "update routine"
                  : "save routine"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => router.push("/learn")}>
              cancel
            </Button>
            {saveMutation.isError && (
              <span className="text-sm text-red-500">
                save failed — is the backend running?
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
