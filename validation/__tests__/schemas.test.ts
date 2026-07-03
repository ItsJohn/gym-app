import { validateWorkoutAnalysis } from "../schemas";

describe("WorkoutAnalysisSchema", () => {
  const valid = {
    onTrack: "on-track",
    score: 80,
    summary: "Good progress.",
    strengths: ["Consistency"],
    concerns: [],
    suggestions: ["Add mobility work"],
  };

  it("accepts a valid analysis", () => {
    expect(validateWorkoutAnalysis(valid).success).toBe(true);
  });

  it("rejects an invalid onTrack value", () => {
    const result = validateWorkoutAnalysis({ ...valid, onTrack: "maybe" });
    expect(result.success).toBe(false);
  });
});
