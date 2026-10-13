import { Exercise } from "@/validation/schemas";
import { changeExerciseType } from "../exerciseTypes";

const plank: Exercise = {
  id: "plank",
  name: "Plank",
  type: "duration",
  target: { sets: "3", duration: "45", weight: 0 },
  muscle_group: "Core",
  difficulty: "beginner",
};

describe("changeExerciseType", () => {
  it("converts a timed exercise to sets × reps, keeping sets and dropping duration", () => {
    const result = changeExerciseType(plank, "reps-sets");

    expect(result.type).toBe("reps-sets");
    expect(result.target).toEqual({ sets: "3", reps: "10", weight: 0 });
  });
});
