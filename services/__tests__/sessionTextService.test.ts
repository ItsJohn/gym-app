import {
  formatSessionText,
  SessionTextSession,
  SessionTextSet,
} from "@/services/sessionTextService";

const session: SessionTextSession = {
  workout_title: "Push Day",
  started_at: "2026-08-05T09:00:00.000Z",
  completed_at: "2026-08-05T09:45:00.000Z",
  is_completed: 1,
  notes: "Felt strong",
};

const makeSet = (
  exercise_name: string,
  exercise_type: string,
  target: Record<string, unknown>,
  is_completed = 1,
): SessionTextSet => ({
  exercise_name,
  exercise_type,
  target: JSON.stringify(target),
  is_completed,
});

describe("formatSessionText", () => {
  it("should list each exercise with the weights and reps used", () => {
    const sets = [
      makeSet("Bench Press", "reps-sets", { reps: "10", weight: 60 }),
      makeSet("Bench Press", "reps-sets", { reps: "8", weight: 62.5 }),
      makeSet("Lateral Raise", "reps-per-side", { per_side: "12", weight: 10 }),
    ];

    const text = formatSessionText(session, sets, "kg");

    expect(text).toContain("Push Day - Aug 5, 2026");
    expect(text).toContain("Duration: 45m");
    expect(text).toContain("Bench Press");
    expect(text).toContain("  1. 60kg x 10 reps");
    expect(text).toContain("  2. 62.5kg x 8 reps");
    expect(text).toContain("  1. 10kg x 12 reps/side");
    expect(text).toContain("Notes: Felt strong");
  });

  it("should mark sets that were not completed", () => {
    const sets = [
      makeSet("Plank", "duration", { duration: "60" }),
      makeSet("Plank", "duration", { duration: "60" }, 0),
    ];

    const text = formatSessionText(session, sets, "kg");

    expect(text).toContain("  1. 60s");
    expect(text).toContain("  2. 60s (skipped)");
  });
});
