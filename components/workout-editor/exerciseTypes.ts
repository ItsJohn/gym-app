import { Exercise } from "@/validation/schemas";

export type ExerciseType = Exercise["type"];
export type TargetField =
  "sets" | "reps" | "per_side" | "duration" | "distance";

export const EXERCISE_TYPE_OPTIONS: {
  type: ExerciseType;
  label: string;
  fields: TargetField[];
}[] = [
  { type: "reps-sets", label: "Sets × Reps", fields: ["sets", "reps"] },
  { type: "reps", label: "Reps", fields: ["reps"] },
  {
    type: "reps-per-side",
    label: "Per Side",
    fields: ["sets", "per_side"],
  },
  { type: "duration", label: "Timed", fields: ["sets", "duration"] },
  { type: "distance", label: "Distance", fields: ["distance"] },
];

export const TARGET_FIELD_LABELS: Record<TargetField, string> = {
  sets: "Sets",
  reps: "Reps",
  per_side: "Reps per side",
  duration: "Duration (seconds)",
  distance: "Distance (meters)",
};

const TARGET_DEFAULTS: Record<TargetField, string> = {
  sets: "3",
  reps: "10",
  per_side: "10",
  duration: "30",
  distance: "100",
};

export function getTargetFields(type: ExerciseType): TargetField[] {
  return EXERCISE_TYPE_OPTIONS.find((o) => o.type === type)?.fields ?? [];
}

export function changeExerciseType(
  exercise: Exercise,
  type: ExerciseType,
): Exercise {
  const target: Exercise["target"] = { weight: exercise.target.weight };
  for (const field of getTargetFields(type)) {
    target[field] = exercise.target[field] || TARGET_DEFAULTS[field];
  }
  return { ...exercise, type, target };
}
