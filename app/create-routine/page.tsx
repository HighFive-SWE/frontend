"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
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

export default function CreateRoutinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const profileId = useAppStore((s) => s.currentProfileId);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [seeded, setSeeded] = useState(false);

  // if editing, load existing routine and seed the form once.
  useQuery({
    queryKey: ["routine", editId],
    queryFn: () => fetchRoutine(editId!),
    enabled: Boolean(editId) && !seeded,
    gcTime: 0,
    meta: {},
    select: (routine) => {
      if (!seeded) {
        setName(routine.name);
        setDescription(routine.description);
        setSteps(routine.steps);
        setSeeded(true);
      }
      return routine;
    },
  });

  const handleAdd = useCallback(
    (gestureId: GestureId) => {
      if (steps.length >= MAX_STEPS) return;
      const meta = GESTURE_LIST.find((g) => g.id === gestureId);
      setSteps((prev) => [
        ...prev,
        {
          gesture_id: gestureId,
          prompt: `sign '${meta?.title ?? gestureId}'`,
          hint: meta?.hint ?? "",
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
    !saveMutation.isPending;

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <span className="pill w-fit">{editId ? "edit routine" : "new routine"}</span>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
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
